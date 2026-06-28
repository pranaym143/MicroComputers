import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Database, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  LogOut, 
  Upload, 
  FileText, 
  Save, 
  X, 
  BarChart3, 
  Users, 
  Award, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { 
  CertificateService, 
  getSavedSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  getSupabaseClient,
  safeParseJson
} from '../lib/supabase';
import { StudentCertificate, SupabaseConfig } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onLoginStateChange: (isLoggedIn: boolean) => void;
  onSupabaseStateChange: (isConnected: boolean) => void;
}

export default function AdminPanel({
  onClose,
  onLoginStateChange,
  onSupabaseStateChange
}: AdminPanelProps) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig | null>(getSavedSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(supabaseConfig?.supabaseUrl || '');
  const [inputKey, setInputKey] = useState(supabaseConfig?.supabaseAnonKey || '');
  const [inputBucket, setInputBucket] = useState(supabaseConfig?.storageBucket || '');
  const [inputTable, setInputTable] = useState(supabaseConfig?.tableName || 'students');
  const [configSuccess, setConfigSuccess] = useState('');

  // Certificates Database State
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbLoading, setDbLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<any>(null);

  // CRUD & Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formHTN, setFormHTN] = useState('');
  const [formName, setFormName] = useState('');
  const [formCourse, setFormCourse] = useState('Computer Basics');
  const [formYear, setFormYear] = useState('2026');
  const [formGrade, setFormGrade] = useState('A+');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPhone, setFormPhone] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Developer mode detection based on URL queries for developer/administrator setup only
  const isDeveloper = typeof window !== 'undefined' && (
    window.location.search.includes('developer=true') || 
    window.location.search.includes('dev=true') ||
    window.location.hostname === 'localhost'
  );

  // Active Tab synchronized with URL paths
  const [activeTab, setActiveTab] = useState<'analytics' | 'records' | 'add' | 'database'>(() => {
    const path = window.location.pathname;
    if (path === '/dashboard' || path === '/students') return 'records';
    if (path === '/upload') return 'add';
    return 'analytics';
  });

  // Guard activeTab if non-developer tries to access database config
  useEffect(() => {
    if (activeTab === 'database' && !isDeveloper) {
      setActiveTab('analytics');
    }
  }, [activeTab, isDeveloper]);

  // Set initial tab based on path when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const path = window.location.pathname;
      if (path === '/dashboard' || path === '/students') {
        setActiveTab('records');
      } else if (path === '/upload') {
        setActiveTab('add');
      } else if (path === '/admin') {
        setActiveTab('analytics');
      }
    }
  }, [isLoggedIn]);

  // Sync tab updates to the URL path cleanly
  useEffect(() => {
    if (isLoggedIn) {
      let path = '/admin';
      if (activeTab === 'records') {
        const currentPath = window.location.pathname;
        if (currentPath === '/students') {
          path = '/students';
        } else {
          path = '/dashboard';
        }
      } else if (activeTab === 'add') {
        path = '/upload';
      } else if (activeTab === 'database') {
        path = '/admin';
      }

      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  }, [activeTab, isLoggedIn]);

  // Drag and drop upload state
  const [dragOver, setDragOver] = useState(false);

  // Deletion confirmation states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmHtn, setDeleteConfirmHtn] = useState<string | null>(null);

  // Check login session, fetch records & subscribe to real-time updates
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('admin_session') || '';
        const res = await fetch('/api/admin/session', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Admin-Session': token
          }
        });
        if (res.ok) {
          const data = await safeParseJson(res);
          if (data.loggedIn) {
            setIsLoggedIn(true);
            onLoginStateChange(true);

            // Auto-heal/sync configuration back to stateless backend server if cached locally
            const cachedConfig = localStorage.getItem('supabase_config');
            if (cachedConfig) {
              try {
                const parsed = JSON.parse(cachedConfig);
                if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
                  await fetch('/api/config', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                      'X-Admin-Session': token
                    },
                    body: JSON.stringify(parsed),
                  });
                }
              } catch (e) {
                console.error('Failed to auto-sync cached configuration to backend:', e);
              }
            }

            fetchCertificates();
          } else {
            setIsLoggedIn(false);
            onLoginStateChange(false);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
    onSupabaseStateChange(!!supabaseConfig);

    // Set up real-time subscription to listen for database changes instantly across all devices
    console.log('AdminPanel: Initializing Supabase realtime listener...');
    const unsubscribe = CertificateService.subscribeToChanges(() => {
      console.log('Real-time database change detected, auto-refreshing certificates...');
      fetchCertificates();
    });

    return () => {
      if (unsubscribe) {
        console.log('AdminPanel: Cleaning up realtime listener...');
        unsubscribe();
      }
    };
  }, [supabaseConfig]);

  const fetchCertificates = async () => {
    setDbLoading(true);
    try {
      const records = await CertificateService.getAllCertificates();
      setCertificates(records);
      setSupabaseError(null);
    } catch (err: any) {
      console.error('fetchCertificates failed:', err);
      setSupabaseError(err);
    } finally {
      setDbLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      if (res.ok) {
        const data = await safeParseJson(res);
        const token = data.token || 'active';
        localStorage.setItem('admin_session', token);
        window.history.replaceState(null, '', '/dashboard');
        setIsLoggedIn(true);
        onLoginStateChange(true);
        setActiveTab('records');
        fetchCertificates();
      } else {
        const errData = await safeParseJson(res);
        throw new Error(errData.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin_session') || '';
      await fetch('/api/admin/logout', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Admin-Session': token
        }
      });
    } catch (e) {
      console.error('Logout request failed:', e);
    }
    localStorage.removeItem('admin_session');
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {}
    }
    setIsLoggedIn(false);
    onLoginStateChange(false);
    setEmail('');
    setPassword('');
  };

  // Supabase Configuration Saver
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess('');

    if (!inputUrl.trim() || !inputKey.trim() || !inputBucket.trim() || !inputTable.trim()) {
      return;
    }

    const newConfig: SupabaseConfig = {
      supabaseUrl: inputUrl.trim(),
      supabaseAnonKey: inputKey.trim(),
      storageBucket: inputBucket.trim(),
      tableName: inputTable.trim(),
    };

    saveSupabaseConfig(newConfig);
    setSupabaseConfigState(newConfig);
    onSupabaseStateChange(true);
    setConfigSuccess('Supabase credentials successfully integrated! Reloading records...');
    fetchCertificates();
  };

  // Supabase Clear Config (Reset to Mock)
  const handleClearConfig = () => {
    clearSupabaseConfig();
    setSupabaseConfigState(null);
    setInputUrl('');
    setInputKey('');
    setInputBucket('');
    setInputTable('students');
    onSupabaseStateChange(false);
    setConfigSuccess('Returned to local simulation mode successfully.');
    fetchCertificates();
  };

  // Certificate PDF File Selector (stores the selected file in local state to be uploaded sequentially upon saving)
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setFormError('Only PDF files are allowed for certificates.');
      return;
    }

    setFormError('');
    setSelectedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileUrl(''); // Clear any old URL to ensure upload of new file
    setFormSuccess(`File "${file.name}" selected successfully.`);
    setTimeout(() => setFormSuccess(''), 3000);
  };

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Create or Update certificate record with sequential file upload and verification
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formHTN.trim() || !formName.trim() || !formCourse.trim() || !formYear.trim()) {
      setFormError('Student Name, Hall Ticket Number, Course Name, and Completion Year are required fields.');
      return;
    }

    // Verify PDF is provided (either a newly selected file or an existing file in edit mode)
    if (!selectedFile && !uploadedFileUrl) {
      setFormError('Please select a Certificate PDF before saving.');
      return;
    }

    setFileUploading(true);
    let finalFileUrl = uploadedFileUrl;
    let finalFileName = uploadedFileName;

    try {
      // STEP 1 & 2: Upload the PDF file to the Supabase "certificates" bucket
      if (selectedFile) {
        console.log('STEP 1: Starting PDF upload to Supabase "certificates" bucket...');
        const uploadRes = await CertificateService.uploadCertificateFile(selectedFile);
        
        // STEP 3: Verify storage upload success and obtain the uploaded file path (public URL)
        if (!uploadRes || !uploadRes.url) {
          throw new Error('Supabase storage upload completed, but returned empty file path/URL verification.');
        }
        
        console.log('STEP 2 & 3: File upload verified successfully. URL:', uploadRes.url);
        finalFileUrl = uploadRes.url;
        finalFileName = uploadRes.fileName;
        setUploadedFileUrl(finalFileUrl);
        setUploadedFileName(finalFileName);
      }

      // STEP 4: Insert a row into the students table
      const certData = {
        hall_ticket_number: formHTN.trim().toUpperCase(),
        student_name: formName.trim(),
        course: formCourse,
        course_name: formCourse,
        year: formYear.trim(),
        completion_year: formYear.trim(),
        grade: formGrade || 'A+',
        issue_date: formIssueDate,
        certificate_url: finalFileUrl,
        file_name: finalFileName,
        phone_number: formPhone.trim() || undefined
      };

      if (isEditing && editingId) {
        console.log('STEP 4: Updating student record in Supabase...');
        await CertificateService.updateCertificate(editingId, certData);
      } else {
        // Check duplicate Hall Ticket number
        const exists = certificates.some(c => c.hall_ticket_number.toUpperCase() === certData.hall_ticket_number);
        if (exists) {
          setFormError(`A certificate with Hall Ticket Number "${certData.hall_ticket_number}" already exists.`);
          setFileUploading(false);
          return;
        }
        console.log('STEP 4: Inserting student record in Supabase...');
        await CertificateService.addCertificate(certData);
      }

      // STEP 5: Display success status
      setFormSuccess('Student saved successfully.');
      setSelectedFile(null);

      // Refresh admin dashboard lists and fetch fresh data from Supabase instantly
      await fetchCertificates();

      // Clear form and navigate cleanly
      setTimeout(() => {
        resetForm();
        setActiveTab('records');
      }, 1500);

    } catch (err: any) {
      console.error('Failed to upload or save student:', err);
      // Stop process, do NOT use local fallback, and display the actual error directly
      setFormError(err?.message || String(err));
    } finally {
      setFileUploading(false);
    }
  };

  // Edit action
  const startEdit = (cert: StudentCertificate) => {
    setIsEditing(true);
    setEditingId(cert.id);
    setFormHTN(cert.hall_ticket_number);
    setFormName(cert.student_name);
    setFormCourse(cert.course);
    setFormYear(cert.year);
    setFormGrade(cert.grade || 'A');
    setFormIssueDate(cert.issue_date);
    setUploadedFileUrl(cert.certificate_url || '');
    setUploadedFileName(cert.file_name || '');
    setFormPhone(cert.phone_number || '');
    setActiveTab('add');
  };

  // Delete action
  const handleDelete = (id: string, htn: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmHtn(htn);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await CertificateService.deleteCertificate(deleteConfirmId);
        fetchCertificates();
      } catch (err) {
        console.error('Delete error', err);
      } finally {
        setDeleteConfirmId(null);
        setDeleteConfirmHtn(null);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormHTN('');
    setFormName('');
    setFormCourse('Computer Basics');
    setFormYear('2026');
    setFormGrade('A+');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setUploadedFileUrl('');
    setUploadedFileName('');
    setFormPhone('');
    setFormError('');
    setFormSuccess('');
    setSelectedFile(null);
  };

  // Filtered certificates search matching
  const filteredCerts = certificates.filter(cert => {
    const q = searchQuery.toLowerCase();
    return (
      cert.student_name.toLowerCase().includes(q) ||
      cert.hall_ticket_number.toLowerCase().includes(q) ||
      cert.course.toLowerCase().includes(q) ||
      cert.year.toLowerCase().includes(q)
    );
  });

  // Calculate high-level metrics for dashboard
  const totalCerts = certificates.length;
  const coursesCount = certificates.reduce((acc, cert) => {
    acc[cert.course] = (acc[cert.course] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueCourses = Object.keys(coursesCount).length;
  const gradeDistribution = certificates.reduce((acc, cert) => {
    const g = cert.grade || 'A';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 bg-[#030014]/45 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8" id="admin-modal">
      <div className="w-full max-w-6xl glass-panel rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col min-h-[85vh] max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-lg text-white">Micro Computers Admin Console</h2>
              <p className="text-[10px] font-mono text-gray-500 tracking-wider">SECURE AUTHORIZED SESSION</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/3 border border-white/5 text-gray-400 hover:text-white cursor-pointer"
            id="close-admin-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT LOGGED IN LAYOUT */}
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col justify-start md:justify-center items-center py-12 px-6 overflow-y-auto">
            <div className="w-full max-w-md bg-white/3 p-8 rounded-3xl border border-white/5 space-y-6 my-auto">
              <div className="text-center space-y-2">
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full w-fit mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-xl text-white">Admin Authentication</h3>
                <p className="text-xs text-gray-400">Authorized personnel only. Access strictly logged.</p>
              </div>

               {/* Database Status notice shown only to the Developer */}
              {isDeveloper ? (
                <>
                  {!supabaseConfig ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
                      <div className="flex gap-2 text-amber-400 items-start">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Local Simulation Active</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        "Please provide your personal Supabase credentials and storage details."
                      </p>
                       <p className="text-[10px] text-gray-500 italic">
                        Testing admin login: <strong className="text-gray-300">microcomputers@gmail.com</strong> with password <strong className="text-gray-300">computer@123</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-left font-mono flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span>Using Real Supabase DB & Auth</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs text-left font-mono flex items-center gap-2 justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-violet-400" />
                  <span>Enforced Secure Admin Connection</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Admin-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Admin-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs"
                    id="admin-email-input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs"
                    id="admin-password-input"
                  />
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full glass-button-primary py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider text-white cursor-pointer"
                  id="admin-login-submit"
                >
                  {loginLoading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* LOGGED IN DASHBOARD LAYOUT */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-transparent flex flex-row md:flex-col p-4 md:p-6 gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium tracking-wide shrink-0 md:shrink transition-all cursor-pointer liquid-glass-tab-btn ${
                  activeTab === 'analytics' ? 'active' : ''
                }`}
                id="tab-analytics"
              >
                <BarChart3 className="w-4 h-4" />
                DASHBOARD METRICS
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium tracking-wide shrink-0 md:shrink transition-all cursor-pointer liquid-glass-tab-btn ${
                  activeTab === 'records' ? 'active' : ''
                }`}
                id="tab-records"
              >
                <Users className="w-4 h-4" />
                MANAGE STUDENTS
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add');
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium tracking-wide shrink-0 md:shrink transition-all cursor-pointer liquid-glass-tab-btn ${
                  activeTab === 'add' ? 'active' : ''
                }`}
                id="tab-add-new"
              >
                <Plus className="w-4 h-4" />
                {isEditing ? 'EDIT CERTIFICATE' : 'UPLOAD CERTIFICATE'}
              </button>
              {isDeveloper && (
                <button
                  onClick={() => setActiveTab('database')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium tracking-wide shrink-0 md:shrink transition-all cursor-pointer liquid-glass-tab-btn ${
                    activeTab === 'database' ? 'active' : ''
                  }`}
                  id="tab-supabase"
                >
                  <Settings className="w-4 h-4" />
                  DATABASE CONFIG
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent transition-all mt-auto cursor-pointer"
                id="btn-admin-logout"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT
              </button>
            </div>

            {/* Main Workspace Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
              
              {supabaseError && (
                <div className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/25 text-left space-y-3">
                  <div className="flex gap-2 text-red-400 items-center font-bold text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    SUPABASE DATABASE SCHEMA WARNING
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-mono">
                    {supabaseError.message?.includes('schema cache') || supabaseError.message?.includes('PGRST205') || (typeof supabaseError === 'string' && (supabaseError.includes('certificates') || supabaseError.includes('students') || supabaseError.includes(supabaseConfig?.tableName || ''))) || (supabaseError.code === 'PGRST205')
                      ? `Warning: The table '${supabaseConfig?.tableName || 'students'}' was not found in your Supabase database schema cache. Please execute the SQL migration command below in your Supabase SQL Editor to create this table, then reload your PostgREST schema cache.`
                      : (supabaseError.message || String(supabaseError))}
                  </p>
                  {(supabaseError.message?.includes('schema cache') || supabaseError.message?.includes('PGRST205') || (typeof supabaseError === 'string' && (supabaseError.includes('certificates') || supabaseError.includes('students') || supabaseError.includes(supabaseConfig?.tableName || ''))) || (supabaseError.code === 'PGRST205')) && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Run this SQL in your Supabase SQL Editor:</div>
                      <pre className="p-3.5 rounded-xl bg-black/40 text-[10px] font-mono text-violet-300 overflow-x-auto select-all leading-relaxed">
{`create table ${supabaseConfig?.tableName || 'students'} (
  id uuid default gen_random_uuid() primary key,
  hall_ticket_number text unique not null,
  student_name text not null,
  course text,
  year text,
  grade text,
  issue_date date,
  certificate_url text,
  file_name text,
  phone_number text,
  course_name text,
  completion_year text
);`}
                      </pre>
                    </div>
                  )}
                  <div className="text-[11px] text-gray-400">
                    <strong className="text-violet-400">Note:</strong> While this error is active, the app continues to operate flawlessly by automatically falling back to our persistent server database storage.
                  </div>
                </div>
              )}
              
              {/* TAB 1: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-8" id="view-analytics">
                  {/* Alert banner for database */}
                  {!supabaseConfig && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/15 text-left space-y-1">
                      <div className="flex gap-2 text-amber-400 items-center font-bold text-xs font-mono">
                        <AlertTriangle className="w-4 h-4" />
                        DATABASE NOTICE
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        "Please provide your personal Supabase project URL, API keys, storage bucket details, and database schema to complete the certificate management system."
                      </p>
                    </div>
                  )}

                  {/* Summary Metric widgets */}
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Certificates Issued</p>
                        <h4 className="text-3xl font-display font-bold text-white mt-1">{totalCerts}</h4>
                      </div>
                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Modules</p>
                        <h4 className="text-3xl font-display font-bold text-white mt-1">{uniqueCourses}</h4>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">DB Sync State</p>
                        <h4 className="text-sm font-mono font-semibold text-emerald-400 mt-2">
                          {supabaseConfig ? 'REAL SUPABASE' : 'LOCAL SIMULATOR'}
                        </h4>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Database className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics details */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Course Distribution list */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
                      <h4 className="text-sm font-mono uppercase tracking-wider text-gray-300 font-semibold mb-6 pb-2 border-b border-white/5">
                        Course-wise Registrations
                      </h4>
                      {Object.keys(coursesCount).length > 0 ? (
                        <div className="space-y-4">
                          {Object.keys(coursesCount).map((cName) => {
                            const count = coursesCount[cName] || 0;
                            const percent = totalCerts > 0 ? Math.round((count / totalCerts) * 100) : 0;
                            return (
                              <div key={cName} className="space-y-1.5">
                                <div className="flex justify-between text-xs text-gray-300">
                                  <span>{cName}</span>
                                  <span className="font-mono text-gray-400">{count} student(s) ({percent}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 font-mono">No data available.</p>
                      )}
                    </div>

                    {/* Grade breakdown */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
                      <h4 className="text-sm font-mono uppercase tracking-wider text-gray-300 font-semibold mb-6 pb-2 border-b border-white/5">
                        Performance Grade Splits
                      </h4>
                      {Object.keys(gradeDistribution).length > 0 ? (
                        <div className="space-y-4">
                          {Object.keys(gradeDistribution).map((gradeName) => {
                            const count = gradeDistribution[gradeName] || 0;
                            const percent = totalCerts > 0 ? Math.round((count / totalCerts) * 100) : 0;
                            return (
                              <div key={gradeName} className="flex justify-between items-center p-3 rounded-xl bg-white/2 border border-white/5">
                                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
                                  {gradeName}
                                </span>
                                <span className="text-xs text-gray-300">{count} student(s)</span>
                                <span className="text-xs text-gray-500 font-mono">{percent}%</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 font-mono">No data available.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE CERTIFICATES */}
              {activeTab === 'records' && (
                <div className="space-y-6" id="view-records">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search student or hall ticket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-white text-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('add');
                      }}
                      className="glass-button-primary px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      ADD STUDENT RECORD
                    </button>
                  </div>

                  {/* Database table */}
                  {dbLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                      <span className="text-xs font-mono">Fetching certificates...</span>
                    </div>
                  ) : filteredCerts.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/25 backdrop-blur-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/3 font-mono uppercase tracking-wider text-gray-400">
                            <th className="p-4 font-semibold">Hall Ticket</th>
                            <th className="p-4 font-semibold">Student Name</th>
                            <th className="p-4 font-semibold">Course</th>
                            <th className="p-4 font-semibold">Year / Grade</th>
                            <th className="p-4 font-semibold">PDF File</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredCerts.map((cert) => (
                            <tr key={cert.id} className="hover:bg-white/1 transition-all">
                              <td className="p-4 font-mono font-semibold text-violet-300">{cert.hall_ticket_number}</td>
                              <td className="p-4 text-white font-medium">{cert.student_name}</td>
                              <td className="p-4 text-gray-300">{cert.course}</td>
                              <td className="p-4 text-gray-400 font-mono">
                                {cert.year} <span className="text-[10px] text-amber-400 ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{cert.grade}</span>
                              </td>
                              <td className="p-4 text-gray-400">
                                {cert.certificate_url ? (
                                  <a 
                                    href={cert.certificate_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-emerald-400 hover:underline flex items-center gap-1.5 font-mono text-[10px]"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {cert.file_name || 'View PDF'}
                                  </a>
                                ) : (
                                  <span className="text-gray-600 font-mono text-[10px]">Coded (No PDF)</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => startEdit(cert)}
                                    className="p-2 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 hover:text-white cursor-pointer"
                                    title="Edit Student Information"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cert.id, cert.hall_ticket_number)}
                                    className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-white cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-16 rounded-2xl border border-white/5 text-center text-gray-500 font-mono">
                      No matching student certificates found in the database.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ADD/UPLOAD CERTIFICATE FORM */}
              {activeTab === 'add' && (
                <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-white/5 space-y-6 text-left" id="view-form">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <h3 className="font-display font-semibold text-lg text-white">
                      {isEditing ? 'Modify Student Certificate' : 'Upload Student Certificate'}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-xs text-gray-400 hover:text-white font-mono"
                    >
                      RESET FORM
                    </button>
                  </div>

                  <form onSubmit={handleSaveRecord} className="space-y-5">
                    {/* Hall Ticket & Name */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                          Hall Ticket Number <span className="text-violet-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MC-2026-005"
                          value={formHTN}
                          onChange={(e) => setFormHTN(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                          Student Name <span className="text-violet-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Karunakar Sarabu"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Course Selection & Year */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Course Name <span className="text-violet-400">*</span></label>
                        <select
                          value={formCourse}
                          onChange={(e) => setFormCourse(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs bg-[#030014]/80"
                        >
                          <option value="Computer Basics">Computer Basics</option>
                          <option value="MS Office Suite">MS Office Suite</option>
                          <option value="Programming Python & Java">Programming Python & Java</option>
                          <option value="Data Entry & Accounting (Tally)">Data Entry & Accounting (Tally)</option>
                          <option value="Internet Applications">Internet Applications</option>
                          <option value="Professional Certification">Professional Certification</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Completion Year <span className="text-violet-400">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2026"
                          value={formYear}
                          onChange={(e) => setFormYear(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Grade, Issue Date & Phone Number */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Assigned Grade</label>
                        <input
                          type="text"
                          placeholder="e.g. A+ or O (Outstanding)"
                          value={formGrade}
                          onChange={(e) => setFormGrade(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Issue Date</label>
                        <input
                          type="date"
                          value={formIssueDate}
                          onChange={(e) => setFormIssueDate(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. +91 9876543210"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* PDF Document Upload */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                        Certificate PDF <span className="text-violet-400">*</span>
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          dragOver
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/2'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-picker"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        />
                        <label htmlFor="file-picker" className="cursor-pointer space-y-2.5 block">
                          {fileUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                              <p className="text-xs text-gray-400 font-mono">Uploading to storage bucket...</p>
                            </div>
                          ) : uploadedFileUrl ? (
                            <div className="space-y-1">
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                              <p className="text-xs text-white font-mono font-medium">{uploadedFileName}</p>
                              <p className="text-[10px] text-gray-500 font-mono">Drag and drop a new file to replace it.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <UploadCloud className="w-8 h-8 text-violet-400 mx-auto animate-float-slow" />
                              <p className="text-xs text-gray-300 font-medium">Drag & drop your PDF file, or click to browse</p>
                              <p className="text-[10px] text-gray-500 font-mono">Only PDF documents are supported for download attachments.</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {formError && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                        {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex gap-2 items-center">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        <span>{formSuccess}</span>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActiveTab('records');
                        }}
                        className="glass-button px-5 py-3 rounded-xl text-xs font-mono font-medium text-gray-400 hover:text-white cursor-pointer"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={fileUploading}
                        className="glass-button-primary px-8 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-white cursor-pointer"
                      >
                        {isEditing ? 'UPDATE RECORD' : 'SAVE STUDENT RECORD'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: SUPABASE DATABASE CONNECTION CONFIG */}
              {activeTab === 'database' && isDeveloper && (
                <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-white/5 space-y-6 text-left" id="view-database">
                  <div className="space-y-2 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2 text-violet-400">
                      <Database className="w-5 h-5" />
                      <h3 className="font-display font-semibold text-lg text-white">Database Integration Manager</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      "Please provide your personal Supabase credentials and storage details."
                    </p>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Supabase URL <span className="text-violet-400">*</span></label>
                      <input
                        type="url"
                        required
                        placeholder="https://your-project-id.supabase.co"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Supabase API Key (Anon / Public Key) <span className="text-violet-400">*</span></label>
                      <input
                        type="password"
                        required
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Storage Bucket Name <span className="text-violet-400">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. certificates"
                          value={inputBucket}
                          onChange={(e) => setInputBucket(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">Database Table Name <span className="text-violet-400">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. certificates"
                          value={inputTable}
                          onChange={(e) => setInputTable(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    {configSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex gap-2 items-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{configSuccess}</span>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between items-center">
                      {supabaseConfig ? (
                        <button
                          type="button"
                          onClick={handleClearConfig}
                          className="text-xs text-red-400 hover:text-red-300 font-mono tracking-wider hover:underline"
                        >
                          DISCONNECT & GO LOCAL
                        </button>
                      ) : (
                        <div className="text-[11px] text-gray-500 italic font-mono">Local simulation fallback active</div>
                      )}

                      <button
                        type="submit"
                        className="glass-button-primary px-8 py-3 rounded-xl text-xs font-mono font-bold tracking-wider text-white cursor-pointer"
                      >
                        SAVE & CONNECT SUPABASE
                      </button>
                    </div>
                  </form>

                  {/* Schema instructions details box */}
                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold">Expected Database Schema</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Make sure your Supabase table matches the schema structure:
                    </p>
                    <pre className="p-3.5 rounded-xl bg-black/40 text-[10px] font-mono text-violet-300 overflow-x-auto leading-relaxed">
{`create table ${supabaseConfig?.tableName || 'students'} (
  id uuid default gen_random_uuid() primary key,
  hall_ticket_number text unique not null,
  student_name text not null,
  course text,
  year text,
  grade text,
  issue_date date,
  certificate_url text,
  file_name text,
  phone_number text,
  course_name text,
  completion_year text
);`}
                    </pre>
                  </div>

                  {/* RLS Policy Fix instructions details box */}
                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <h4 className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold">Fixing Row-Level Security (RLS) Errors</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      If you receive the error <code className="text-amber-300 font-mono">new row violates row-level security policy</code> when saving records or uploading files, it means Supabase Row-Level Security (RLS) is enabled but blocking requests.
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                      Run these SQL statements in your <strong>Supabase SQL Editor</strong> to fix it:
                    </p>
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 font-bold">1. Fix Table Access ({supabaseConfig?.tableName || 'students'}):</div>
                      <pre className="p-3.5 rounded-xl bg-black/40 text-[10px] font-mono text-amber-300 overflow-x-auto leading-relaxed select-all">
{`-- OPTION A (Easiest for testing/prototypes): Disable RLS altogether
alter table ${supabaseConfig?.tableName || 'students'} disable row level security;

-- OPTION B (Enable RLS, but allow all public reads and writes):
create policy "Allow public read-write" on ${supabaseConfig?.tableName || 'students'}
  for all to public using (true) with check (true);`}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-gray-400 font-bold">2. Fix Storage Uploads ({supabaseConfig?.storageBucket || 'certificates'}):</div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        First, go to <strong>Storage</strong> in Supabase, select your bucket, and click <strong>Make public</strong>. Then run this SQL to authorize file uploads:
                      </p>
                      <pre className="p-3.5 rounded-xl bg-black/40 text-[10px] font-mono text-amber-300 overflow-x-auto leading-relaxed select-all">
{`-- Allow public uploads to storage bucket
create policy "Allow public uploads" on storage.objects
  for insert to public with check (bucket_id = '${supabaseConfig?.storageBucket || 'certificates'}');

-- Allow public reads from storage bucket
create policy "Allow public reads" on storage.objects
  for select to public using (bucket_id = '${supabaseConfig?.storageBucket || 'certificates'}');

-- Allow public updates/deletes
create policy "Allow public updates" on storage.objects
  for update to public using (bucket_id = '${supabaseConfig?.storageBucket || 'certificates'}');

create policy "Allow public deletes" on storage.objects
  for delete to public using (bucket_id = '${supabaseConfig?.storageBucket || 'certificates'}');`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Custom delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-[#030014]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b081e] border border-red-500/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(239,68,68,0.15)] space-y-4">
            <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm Deletion
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete the certificate with Hall Ticket Number:{' '}
              <span className="font-mono text-red-400 font-bold">{deleteConfirmHtn}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmHtn(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-500 border border-red-500/20 shadow-lg shadow-red-600/20 cursor-pointer transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
