import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentCertificate, SupabaseConfig } from '../types';

// Pre-seeded local student certificate records
export const PRE_SEEDED_CERTIFICATES: StudentCertificate[] = [
  {
    id: 'cert-1',
    hall_ticket_number: 'MC-2026-001',
    student_name: 'Karunakar Sarabu',
    course: 'Programming in Python & Java',
    year: '2026',
    grade: 'A+',
    issue_date: '2026-04-15',
  },
  {
    id: 'cert-2',
    hall_ticket_number: 'MC-2026-002',
    student_name: 'Sriram Shiva',
    course: 'Computer Basics & MS Office',
    year: '2025',
    grade: 'A',
    issue_date: '2025-11-20',
  },
  {
    id: 'cert-3',
    hall_ticket_number: 'MC-2026-003',
    student_name: 'M. Anitha Reddy',
    course: 'Professional Certification in Data Entry & Tally',
    year: '2026',
    grade: 'O (Outstanding)',
    issue_date: '2026-05-10',
  },
  {
    id: 'cert-4',
    hall_ticket_number: 'MC-2026-004',
    student_name: 'V. Naresh Kumar',
    course: 'Web Development & Internet Applications',
    year: '2026',
    grade: 'A+',
    issue_date: '2026-06-01',
  }
];

// Shared global state caches
let activeConfig: SupabaseConfig | null = null;
let supabaseClient: SupabaseClient | null = null;

// Initialize configurations from the backend
export async function initializeConfigAndCertificates(): Promise<void> {
  // Fetch active Supabase config from the backend
  try {
    const res = await fetch('/api/config?t=' + Date.now());
    if (res.ok) {
      const config = await res.json();
      activeConfig = config;
      supabaseClient = null; // Clear cached client to force re-creation
    }
  } catch (err) {
    console.warn('Failed to load active Supabase config from server:', err);
  }
}

// Helper to get Supabase config from default environment variables or memory
export function getSavedSupabaseConfig(): SupabaseConfig | null {
  if (activeConfig) {
    return activeConfig;
  }

  // Use environment variables or provided credentials as default
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://lrhrsijdijkjqlozwfiz.supabase.co';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_frDxl4Ijnvf9RMfJ6sjEBg_pGpDJmeb';

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    storageBucket: 'certificates',
    tableName: 'students',
  };
}

// Helper to save Supabase config
export function saveSupabaseConfig(config: SupabaseConfig): void {
  activeConfig = config;
  supabaseClient = null;

  // Send config updates asynchronously to backend to share with all clients
  fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  }).catch(err => {
    console.error('Failed to sync config to backend server:', err);
  });
}

// Helper to remove Supabase config
export function clearSupabaseConfig(): void {
  activeConfig = null;
  supabaseClient = null;

  // Remove config from backend server
  fetch('/api/config', {
    method: 'DELETE',
  }).catch(err => {
    console.error('Failed to clear config on backend server:', err);
  });
}

let currentClientConfigStr = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config) {
    supabaseClient = null;
    currentClientConfigStr = '';
    return null;
  }

  const configStr = JSON.stringify(config);
  if (supabaseClient && currentClientConfigStr === configStr) {
    return supabaseClient;
  }

  if (config.supabaseUrl && config.supabaseAnonKey) {
    try {
      console.log('Initializing fresh Supabase client with config URL:', config.supabaseUrl);
      supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      currentClientConfigStr = configStr;
      return supabaseClient;
    } catch (err) {
      console.warn('Failed to initialize real Supabase client', err);
      supabaseClient = null;
      currentClientConfigStr = '';
    }
  }
  return null;
}

// Unified Certificate Service
export class CertificateService {
  static lastError: any = null;

  static getTableName(): string {
    const config = getSavedSupabaseConfig();
    return config?.tableName || 'students';
  }

  // Subscribe to real-time INSERT, UPDATE, and DELETE changes on the Supabase table
  static subscribeToChanges(onChanges: () => void): (() => void) | null {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const tableName = CertificateService.getTableName();
      const channel = client
        .channel(`public:${tableName}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, and DELETE
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            console.log('Realtime change received:', payload);
            onChanges();
          }
        )
        .subscribe((status) => {
          console.log('Supabase Realtime subscription status:', status);
        });

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Failed to subscribe to realtime changes:', err);
      return null;
    }
  }

  // Search certificate in the table by hall ticket & optional name
  static async searchCertificate(
    hallTicket: string,
    studentName?: string
  ): Promise<StudentCertificate | null> {
    const cleanTicket = hallTicket.trim().toUpperCase();
    const cleanName = studentName?.trim().toLowerCase();

    const client = getSupabaseClient();
    if (client) {
      try {
        const tableName = CertificateService.getTableName();
        const query = client
          .from(tableName)
          .select('*')
          .eq('hall_ticket_number', cleanTicket);

        const { data, error } = await query;
        if (error) throw error;
        CertificateService.lastError = null;

        if (data && data.length > 0) {
          const match = data[0] as any;
          const cert: StudentCertificate = {
            id: match.id || match.hall_ticket_number,
            hall_ticket_number: match.hall_ticket_number,
            student_name: match.student_name,
            course: match.course_name || '',
            year: match.completion_year || '',
            grade: 'A+',
            issue_date: '',
            certificate_url: match.certificate_url,
            file_name: match.file_name,
            phone_number: match.phone_number,
            course_name: match.course_name,
            completion_year: match.completion_year,
          };

          if (cleanName) {
            if (cert.student_name.toLowerCase().includes(cleanName)) {
              return cert;
            }
            return null;
          }
          return cert;
        }
        return null;
      } catch (err) {
        console.error('Real Supabase query error in searchCertificate:', err);
        CertificateService.lastError = err;
        throw err;
      }
    }
    throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
  }

  // Get all certificates from the table (Admin dashboard)
  static async getAllCertificates(): Promise<StudentCertificate[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const tableName = CertificateService.getTableName();
        const { data, error } = await client
          .from(tableName)
          .select('*')
          .order('hall_ticket_number', { ascending: true });

        if (error) throw error;
        CertificateService.lastError = null;

        return (data || []).map((match: any) => ({
          id: match.id || match.hall_ticket_number,
          hall_ticket_number: match.hall_ticket_number,
          student_name: match.student_name,
          course: match.course_name || '',
          year: match.completion_year || '',
          grade: 'A+',
          issue_date: '',
          certificate_url: match.certificate_url,
          file_name: match.file_name,
          phone_number: match.phone_number,
          course_name: match.course_name,
          completion_year: match.completion_year,
        }));
      } catch (err) {
        console.error('Real Supabase query error in getAllCertificates:', err);
        CertificateService.lastError = err;
        throw err;
      }
    }
    throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
  }

  // Add a certificate record with explicit post-save confirmation check and no local fallback
  static async addCertificate(cert: Omit<StudentCertificate, 'id'>): Promise<StudentCertificate> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
    }

    try {
      const payload = {
        hall_ticket_number: cert.hall_ticket_number.trim().toUpperCase(),
        student_name: cert.student_name.trim(),
        course_name: cert.course_name || cert.course,
        completion_year: cert.completion_year || cert.year,
        phone_number: cert.phone_number || null,
        certificate_url: cert.certificate_url || null,
      };

      const tableName = CertificateService.getTableName();
      console.log(`Attempting direct insert into ${tableName}...`, payload);
      
      const { error } = await client
        .from(tableName)
        .insert([payload]);

      if (error) {
        throw error;
      }

      CertificateService.lastError = null;

      // CONFIRMATION STEP: Fetch row from Supabase to verify that it actually exists!
      console.log(`Querying back from Supabase to confirm row exists in ${tableName}...`);
      const { data: confirmData, error: confirmError } = await client
        .from(tableName)
        .select('*')
        .eq('hall_ticket_number', payload.hall_ticket_number);

      if (confirmError || !confirmData || confirmData.length === 0) {
        throw new Error(`Row confirmation failed: Save returned success but the record with Hall Ticket Number "${payload.hall_ticket_number}" could not be found in Supabase.`);
      }

      console.log('Successfully confirmed student row exists in Supabase:', confirmData[0]);
      const saved = confirmData[0];

      return {
        id: saved.id || saved.hall_ticket_number,
        hall_ticket_number: saved.hall_ticket_number,
        student_name: saved.student_name,
        course: saved.course_name || '',
        year: saved.completion_year || '',
        grade: 'A+',
        issue_date: '',
        certificate_url: saved.certificate_url,
        file_name: saved.file_name,
        phone_number: saved.phone_number,
        course_name: saved.course_name,
        completion_year: saved.completion_year,
      };
    } catch (err: any) {
      console.error('Real Supabase save error:', err);
      CertificateService.lastError = err;
      throw err;
    }
  }

  // Update a certificate record with post-update confirmation check and no local fallback
  static async updateCertificate(id: string, updated: Partial<StudentCertificate>): Promise<StudentCertificate | null> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
    }

    try {
      const payload: any = {};
      if (updated.hall_ticket_number !== undefined) {
        payload.hall_ticket_number = updated.hall_ticket_number.trim().toUpperCase();
      }
      if (updated.student_name !== undefined) {
        payload.student_name = updated.student_name.trim();
      }
      if (updated.course_name !== undefined || updated.course !== undefined) {
        payload.course_name = updated.course_name || updated.course;
      }
      if (updated.completion_year !== undefined || updated.year !== undefined) {
        payload.completion_year = updated.completion_year || updated.year;
      }
      if (updated.phone_number !== undefined) {
        payload.phone_number = updated.phone_number || null;
      }
      if (updated.certificate_url !== undefined) {
        payload.certificate_url = updated.certificate_url || null;
      }

      const htn = updated.hall_ticket_number || id;
      const tableName = CertificateService.getTableName();
      console.log(`Attempting direct update of ${id} in ${tableName}...`, payload);

      let query = client.from(tableName).update(payload);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        query = query.or(`id.eq."${id}",hall_ticket_number.eq."${htn}"`);
      } else {
        query = query.eq('hall_ticket_number', id);
      }

      const { error } = await query;
      if (error) {
        throw error;
      }

      CertificateService.lastError = null;

      // CONFIRMATION STEP: Fetch row from Supabase to verify that it actually exists and is updated!
      console.log(`Querying back from Supabase to confirm updated row exists in ${tableName}...`);
      let confirmQuery = client.from(tableName).select('*');
      if (uuidRegex.test(id)) {
        confirmQuery = confirmQuery.or(`id.eq."${id}",hall_ticket_number.eq."${htn}"`);
      } else {
        confirmQuery = confirmQuery.eq('hall_ticket_number', htn);
      }

      const { data: confirmData, error: confirmError } = await confirmQuery;
      if (confirmError || !confirmData || confirmData.length === 0) {
        throw new Error(`Row confirmation failed: Update returned success but the record could not be found in Supabase.`);
      }

      console.log('Successfully confirmed updated student row exists in Supabase:', confirmData[0]);
      const saved = confirmData[0];

      return {
        id: saved.id || saved.hall_ticket_number,
        hall_ticket_number: saved.hall_ticket_number,
        student_name: saved.student_name,
        course: saved.course_name || '',
        year: saved.completion_year || '',
        grade: 'A+',
        issue_date: '',
        certificate_url: saved.certificate_url,
        file_name: saved.file_name,
        phone_number: saved.phone_number,
        course_name: saved.course_name,
        completion_year: saved.completion_year,
      };
    } catch (err: any) {
      console.error('Real Supabase update error:', err);
      CertificateService.lastError = err;
      throw err;
    }
  }

  // Delete a certificate record from the table
  static async deleteCertificate(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
    }

    try {
      const tableName = CertificateService.getTableName();
      let query = client.from(tableName).delete();
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        query = query.or(`id.eq."${id}",hall_ticket_number.eq."${id}"`);
      } else {
        query = query.eq('hall_ticket_number', id);
      }

      const { error } = await query;
      if (error) throw error;
      CertificateService.lastError = null;
      return true;
    } catch (err: any) {
      console.error('Real Supabase delete error:', err);
      CertificateService.lastError = err;
      throw err;
    }
  }

  // Upload PDF to Supabase certificates bucket
  static async uploadCertificateFile(file: File): Promise<{ url: string; fileName: string }> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not initialized. Please configure Supabase in Database Settings.');
    }

    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    const config = getSavedSupabaseConfig()!;
    const bucketName = config.storageBucket || 'certificates';

    console.log(`Uploading file ${file.name} to Supabase bucket "${bucketName}"...`);
    const { error, data: uploadData } = await client.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Real Supabase storage upload error:', error);
      throw error;
    }

    if (!uploadData) {
      throw new Error('Supabase upload completed but no data return was verified.');
    }

    const { data } = client.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!data || !data.publicUrl) {
      throw new Error('Failed to obtain the public URL for the uploaded file.');
    }

    return {
      url: data.publicUrl,
      fileName: file.name
    };
  }
}
