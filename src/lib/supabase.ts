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

// Key names for localStorage
const CONFIG_KEY = 'micro_computers_supabase_config';
const LOCAL_CERTS_KEY = 'micro_computers_local_certificates';

// Shared global state caches
let activeConfig: SupabaseConfig | null = null;
let cachedLocalCertificates: StudentCertificate[] | null = null;
let supabaseClient: SupabaseClient | null = null;

// Initialize configurations and cached local certificates from the backend
export async function initializeConfigAndCertificates(): Promise<void> {
  // 1. Fetch active Supabase config from the backend
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      activeConfig = config;
      // If server provides custom credentials, sync them to local storage as fallback
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      }
      supabaseClient = null; // Clear cached client to force re-creation
    }
  } catch (err) {
    console.warn('Failed to load active Supabase config from server:', err);
  }

  // 2. Fetch local certificates fallback list from the backend
  try {
    const res = await fetch('/api/certificates');
    if (res.ok) {
      const certs = await res.json();
      cachedLocalCertificates = certs;
      localStorage.setItem(LOCAL_CERTS_KEY, JSON.stringify(certs));
    }
  } catch (err) {
    console.warn('Failed to load local certificates list from server:', err);
  }
}

// Helper to get Supabase config from localStorage or default environment variables
export function getSavedSupabaseConfig(): SupabaseConfig | null {
  if (activeConfig) {
    return activeConfig;
  }

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      activeConfig = parsed;
      return parsed;
    }
  } catch (e) {
    console.error('Error loading Supabase config', e);
  }

  // Use environment variables or provided credentials as default
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://lrhrsijdijkjqlozwfiz.supabase.co';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_frDxl4Ijnvf9RMfJ6sjEBg_pGpDJmeb';

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    storageBucket: 'certificates',
    tableName: 'certificates',
  };
}

// Helper to save Supabase config
export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
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
  localStorage.removeItem(CONFIG_KEY);
  activeConfig = null;
  supabaseClient = null;

  // Remove config from backend server
  fetch('/api/config', {
    method: 'DELETE',
  }).catch(err => {
    console.error('Failed to clear config on backend server:', err);
  });
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSavedSupabaseConfig();
  if (config && config.supabaseUrl && config.supabaseAnonKey) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      return supabaseClient;
    } catch (err) {
      console.warn('Failed to initialize real Supabase client', err);
      supabaseClient = null;
    }
  }
  return null;
}

// Local Database fallback implementation
export function getLocalCertificates(): StudentCertificate[] {
  if (cachedLocalCertificates) {
    return cachedLocalCertificates;
  }

  try {
    const data = localStorage.getItem(LOCAL_CERTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      cachedLocalCertificates = parsed;
      return parsed;
    } else {
      // Seed initial data
      localStorage.setItem(LOCAL_CERTS_KEY, JSON.stringify(PRE_SEEDED_CERTIFICATES));
      cachedLocalCertificates = PRE_SEEDED_CERTIFICATES;
      return PRE_SEEDED_CERTIFICATES;
    }
  } catch (e) {
    return PRE_SEEDED_CERTIFICATES;
  }
}

export function saveLocalCertificates(certs: StudentCertificate[]): void {
  localStorage.setItem(LOCAL_CERTS_KEY, JSON.stringify(certs));
  cachedLocalCertificates = certs;

  // Push updates asynchronously to backend database JSON file to sync with other devices immediately
  fetch('/api/certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(certs),
  }).catch(err => {
    console.error('Failed to sync certificates list to backend server:', err);
  });
}

// Unified Certificate Service
export class CertificateService {
  // Search certificate by hall ticket & optional name
  static async searchCertificate(
    hallTicket: string,
    studentName?: string
  ): Promise<StudentCertificate | null> {
    const cleanTicket = hallTicket.trim().toUpperCase();
    const cleanName = studentName?.trim().toLowerCase();

    const client = getSupabaseClient();
    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        let query = client
          .from(config.tableName)
          .select('*')
          .eq('hall_ticket_number', cleanTicket);

        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) {
          const match = data[0] as StudentCertificate;
          if (cleanName) {
            if (match.student_name.toLowerCase().includes(cleanName)) {
              return match;
            }
            return null;
          }
          return match;
        }
        return null;
      } catch (err) {
        console.warn('Real Supabase query error, falling back to local database:', err);
      }
    }

    // Fallback to local certificates
    const certs = getLocalCertificates();
    const found = certs.find(c => c.hall_ticket_number.toUpperCase() === cleanTicket);
    if (found) {
      if (cleanName) {
        if (found.student_name.toLowerCase().includes(cleanName)) {
          return found;
        }
        return null;
      }
      return found;
    }
    return null;
  }

  // Get all certificates (Admin dashboard)
  static async getAllCertificates(): Promise<StudentCertificate[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        const { data, error } = await client
          .from(config.tableName)
          .select('*')
          .order('hall_ticket_number', { ascending: true });

        if (error) throw error;
        return data as StudentCertificate[];
      } catch (err) {
        console.warn('Real Supabase query error, falling back to local database:', err);
      }
    }

    return getLocalCertificates();
  }

  // Add a certificate record
  static async addCertificate(cert: Omit<StudentCertificate, 'id'>): Promise<StudentCertificate> {
    const newId = `cert-${Date.now()}`;
    const newCert: StudentCertificate = { ...cert, id: newId };

    const client = getSupabaseClient();
    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        const { data, error } = await client
          .from(config.tableName)
          .insert([cert])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const savedCert = data[0] as StudentCertificate;
          // Sync with local storage
          const certs = getLocalCertificates();
          const existingIdx = certs.findIndex(c => c.id === savedCert.id || c.hall_ticket_number === savedCert.hall_ticket_number);
          if (existingIdx !== -1) {
            certs[existingIdx] = savedCert;
          } else {
            certs.push(savedCert);
          }
          saveLocalCertificates(certs);
          return savedCert;
        }
      } catch (err) {
        console.warn('Real Supabase save error, falling back to local storage:', err);
      }
    }

    const certs = getLocalCertificates();
    certs.push(newCert);
    saveLocalCertificates(certs);
    return newCert;
  }

  // Update a certificate record
  static async updateCertificate(id: string, updated: Partial<StudentCertificate>): Promise<StudentCertificate | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        const { data, error } = await client
          .from(config.tableName)
          .update(updated)
          .eq('id', id)
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const savedCert = data[0] as StudentCertificate;
          // Sync with local storage
          const certs = getLocalCertificates();
          const idx = certs.findIndex(c => c.id === id);
          if (idx !== -1) {
            certs[idx] = savedCert;
            saveLocalCertificates(certs);
          }
          return savedCert;
        }
      } catch (err) {
        console.warn('Real Supabase update error, falling back to local storage:', err);
      }
    }

    const certs = getLocalCertificates();
    const idx = certs.findIndex(c => c.id === id);
    if (idx !== -1) {
      const merged = { ...certs[idx], ...updated };
      certs[idx] = merged;
      saveLocalCertificates(certs);
      return merged;
    }
    return null;
  }

  // Delete a certificate record
  static async deleteCertificate(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        const { error } = await client
          .from(config.tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.warn('Real Supabase delete error, falling back to local storage:', err);
      }
    }

    // Always keep local storage in sync
    const certs = getLocalCertificates();
    const filtered = certs.filter(c => c.id !== id);
    saveLocalCertificates(filtered);
    return true;
  }

  // Upload certificate file (returns URL of uploaded file)
  static async uploadCertificateFile(file: File): Promise<{ url: string; fileName: string }> {
    const client = getSupabaseClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    if (client) {
      try {
        const config = getSavedSupabaseConfig()!;
        const { error } = await client.storage
          .from(config.storageBucket)
          .upload(fileName, file);

        if (error) throw error;

        const { data } = client.storage
          .from(config.storageBucket)
          .getPublicUrl(fileName);

        return {
          url: data.publicUrl,
          fileName: file.name
        };
      } catch (err) {
        console.warn('Real Supabase storage upload error, falling back to simulation:', err);
      }
    }

    // Fallback: simulated local upload to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string, // base64 representation
          fileName: file.name
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }
}
