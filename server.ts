import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Seed data fallback
const PRE_SEEDED_CERTIFICATES = [
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

const CONFIG_FILE_PATH = path.join(process.cwd(), "supabase-config-db.json");
const CERTS_FILE_PATH = path.join(process.cwd(), "certificates-db.json");

// Helper to load Supabase Config
function loadSupabaseConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading Supabase config file:", e);
  }

  // Fallback to Env variables or hardcoded default
  const envUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lrhrsijdijkjqlozwfiz.supabase.co';
  const envKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_frDxl4Ijnvf9RMfJ6sjEBg_pGpDJmeb';

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    storageBucket: 'certificates',
    tableName: 'students',
  };
}

// Helper to save Supabase Config
function saveSupabaseConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing Supabase config file:", e);
  }
}

// Helper to load Local Certificates list
function loadLocalCertificates() {
  try {
    if (fs.existsSync(CERTS_FILE_PATH)) {
      const content = fs.readFileSync(CERTS_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading certificates file:", e);
  }
  return PRE_SEEDED_CERTIFICATES;
}

// Helper to save Local Certificates list
function saveLocalCertificates(certs: any[]) {
  try {
    fs.writeFileSync(CERTS_FILE_PATH, JSON.stringify(certs, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing certificates file:", e);
  }
}

// Extract file path inside the bucket from any Supabase storage URL
function getStoragePathFromUrl(url: string, bucketName: string): string | null {
  if (!url) return null;
  try {
    const decodedUrl = decodeURIComponent(url);
    const bucketMarker = `/${bucketName}/`;
    const markerIndex = decodedUrl.indexOf(bucketMarker);
    if (markerIndex !== -1) {
      const pathWithQuery = decodedUrl.substring(markerIndex + bucketMarker.length);
      const questionMarkIndex = pathWithQuery.indexOf('?');
      if (questionMarkIndex !== -1) {
        return pathWithQuery.substring(0, questionMarkIndex);
      }
      return pathWithQuery;
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/');
      const bIndex = pathParts.indexOf(bucketName);
      if (bIndex !== -1 && bIndex < pathParts.length - 1) {
        return pathParts.slice(bIndex + 1).join('/');
      }
    }
    
    if (!url.startsWith('http')) {
      return url;
    }
  } catch (e) {
    console.error('Error parsing storage path from URL:', e);
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Disable caching for all API endpoints to guarantee fresh results on every query
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Middleware to authenticate admin-only API endpoints
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const parts = c.trim().split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      acc[key] = val;
      return acc;
    }, {}) : {};

    const authHeader = req.headers.authorization;
    const customHeader = req.headers['x-admin-session'];
    const hasToken = (authHeader === 'Bearer active') || (customHeader === 'active');

    if (cookies['admin_session'] === 'active' || hasToken) {
      return next();
    }
    console.warn(`[AUTH ERROR] Unauthorized attempt to access admin-only endpoint: ${req.method} ${req.path} from IP: ${req.ip}`);
    return res.status(401).json({ error: "Unauthorized access. Please log in as an administrator." });
  };

  // API Route: Admin Login (Cookie-based session)
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();
    const targetPassword = (password || '').trim();

    if (targetEmail === 'microcomputers@gmail.com' && targetPassword === 'computer@123') {
      res.setHeader("Set-Cookie", "admin_session=active; Path=/; HttpOnly; SameSite=None; Secure");
      console.log(`[AUTH SUCCESS] Successful login for admin: ${targetEmail}`);
      return res.json({ success: true, token: 'active' });
    }
    console.warn(`[AUTH ERROR] Failed login attempt for email: ${targetEmail} from IP: ${req.ip}`);
    return res.status(401).json({ error: "Invalid email or password." });
  });

  // API Route: Admin Session Status
  app.get("/api/admin/session", (req, res) => {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const parts = c.trim().split('=');
      const key = parts[0];
      const val = parts.slice(1).join('=');
      acc[key] = val;
      return acc;
    }, {}) : {};

    const authHeader = req.headers.authorization;
    const customHeader = req.headers['x-admin-session'];
    const hasToken = (authHeader === 'Bearer active') || (customHeader === 'active');

    const session = cookies['admin_session'];
    if (session === 'active' || hasToken) {
      return res.json({ loggedIn: true });
    }
    return res.json({ loggedIn: false });
  });

  // API Route: Admin Logout
  app.post("/api/admin/logout", (req, res) => {
    res.setHeader("Set-Cookie", "admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure");
    console.log("[AUTH LOGOUT] Admin logged out successfully");
    res.json({ success: true });
  });

  // API Route: Get Active Supabase Configuration
  app.get("/api/config", (req, res) => {
    const config = loadSupabaseConfig();
    res.json(config);
  });

  // API Route: Save Active Supabase Configuration
  app.post("/api/config", requireAdmin, (req, res) => {
    const config = req.body;
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      console.error("[API ERROR] Save config failed: missing supabaseUrl or supabaseAnonKey");
      return res.status(400).json({ error: "supabaseUrl and supabaseAnonKey are required" });
    }
    const newConfig = {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      storageBucket: config.storageBucket || 'certificates',
      tableName: config.tableName || 'certificates',
    };
    saveSupabaseConfig(newConfig);
    console.log("[API SUCCESS] Supabase configuration updated successfully");
    res.json({ success: true, config: newConfig });
  });

  // API Route: Delete/Clear Active Supabase Configuration
  app.delete("/api/config", requireAdmin, (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        fs.unlinkSync(CONFIG_FILE_PATH);
      }
      console.log("[API SUCCESS] Supabase configuration deleted successfully");
      res.json({ success: true });
    } catch (e: any) {
      console.error("[API ERROR] Failed to clear configuration file:", e);
      res.status(500).json({ error: "Failed to clear configuration file", details: e.message || String(e) });
    }
  });

  // API Route: Get All Local Fallback Certificates
  app.get("/api/certificates", (req, res) => {
    const certs = loadLocalCertificates();
    res.json(certs);
  });

  // API Route: Save/Update Local Fallback Certificates List
  app.post("/api/certificates", requireAdmin, (req, res) => {
    const certs = req.body;
    if (Array.isArray(certs)) {
      saveLocalCertificates(certs);
      console.log(`[API SUCCESS] Local certificates updated successfully: ${certs.length} items`);
      res.json({ success: true, count: certs.length });
    } else {
      console.error("[API ERROR] Expected an array of certificates for bulk save");
      res.status(400).json({ error: "Expected an array of certificates" });
    }
  });

  // API Route: Add or Update a single certificate in Local Fallback List
  app.post("/api/certificates/single", requireAdmin, (req, res) => {
    const newCert = req.body;
    if (!newCert.id || !newCert.hall_ticket_number || !newCert.student_name) {
      console.error("[API ERROR] Missing key properties for single local certificate insert/update");
      return res.status(400).json({ error: "id, hall_ticket_number, and student_name are required" });
    }

    const certs = loadLocalCertificates();
    const existingIdx = certs.findIndex((c: any) => c.id === newCert.id || c.hall_ticket_number.toUpperCase() === newCert.hall_ticket_number.toUpperCase());
    if (existingIdx !== -1) {
      certs[existingIdx] = { ...certs[existingIdx], ...newCert };
    } else {
      certs.push(newCert);
    }
    saveLocalCertificates(certs);
    console.log(`[API SUCCESS] Single local certificate saved: ${newCert.hall_ticket_number}`);
    res.json({ success: true, certificate: newCert });
  });

  // API Route: Delete a single certificate in Local Fallback List
  app.delete("/api/certificates/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    const certs = loadLocalCertificates();
    const filtered = certs.filter((c: any) => c.id !== id);
    saveLocalCertificates(filtered);
    console.log(`[API SUCCESS] Single local certificate deleted with ID: ${id}`);
    res.json({ success: true });
  });

  // API Route: Upload file to server-side uploads directory (highly performant alternative to large base64 in DB)
  app.post("/api/upload", requireAdmin, (req, res) => {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      console.error("[API ERROR] Upload failed: fileName or fileData missing");
      return res.status(400).json({ error: "fileName and fileData are required" });
    }

    try {
      const buffer = Buffer.from(fileData, 'base64');
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileExt = path.extname(fileName) || '.pdf';
      const safeBaseName = path.basename(fileName, fileExt).replace(/[^a-zA-Z0-9.-]/g, '_');
      const safeName = `${Date.now()}-${safeBaseName}${fileExt}`;
      const filePath = path.join(uploadDir, safeName);
      
      fs.writeFileSync(filePath, buffer);
      console.log(`[UPLOAD SUCCESS] Successfully uploaded file on server: ${safeName} (${buffer.length} bytes)`);
      res.json({ success: true, url: `/uploads/${safeName}` });
    } catch (e: any) {
      console.error("[UPLOAD FAILURE] Error processing file upload on server:", e);
      res.status(500).json({ error: "Failed to save file on server", details: e.message || String(e) });
    }
  });

  // API Route: Proxy download to bypass CORS completely and force attachment save dialog in browser
  app.get("/api/download-proxy", async (req, res) => {
    const fileUrl = req.query.url as string;
    const fileName = req.query.filename as string || "certificate.pdf";

    if (!fileUrl) {
      return res.status(400).json({ error: "url parameter is required" });
    }

    try {
      console.log(`Proxying download request for file: ${fileName} from url: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote file: ${response.statusText} (${response.status})`);
      }

      const contentType = response.headers.get("content-type") || "application/pdf";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", contentType);
      // Clean filename from any unsafe characters
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error("Proxy download error:", err);
      res.status(500).json({ error: "Failed to download file via proxy server", details: err.message || String(err) });
    }
  });

  // API Route: Secure certificate download with direct Supabase API validation, signed URL generation and automatic refresh
  app.get("/api/download-certificate", async (req, res) => {
    const fileUrl = req.query.url as string;
    const fileName = req.query.filename as string || "certificate.pdf";
    const isCheckOnly = req.query.check === "true";

    if (!fileUrl) {
      console.error("[DOWNLOAD ERROR] Missing url parameter");
      return res.status(400).json({ error: "url parameter is required" });
    }

    try {
      console.log(`[DOWNLOAD] Process initiated. URL: ${fileUrl}, Check Only: ${isCheckOnly}`);
      const config = loadSupabaseConfig();
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error("Supabase is not configured on server.");
      }

      // Initialize Supabase client on server-side to avoid client RLS restrictions
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const bucketName = config.storageBucket || 'certificates';

      // Parse/clean the storage path
      const filePath = getStoragePathFromUrl(fileUrl, bucketName);
      if (!filePath) {
        console.error(`[DOWNLOAD ERROR] Invalid URL structure or empty path: "${fileUrl}"`);
        return res.status(400).json({ error: "Certificate not found." });
      }

      console.log(`[DOWNLOAD] Extracted storage path: "${filePath}" inside bucket: "${bucketName}"`);

      // 1. Verify that the file exists in the Supabase "certificates" bucket
      console.log(`[DOWNLOAD] Verifying file exists in storage bucket...`);
      const { data: fileList, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', { search: filePath });

      if (listError) {
        console.warn(`[DOWNLOAD WARNING] List error (falling back to direct fetch verification):`, listError.message);
      }

      let exists = false;
      if (fileList && fileList.some(f => f.name === filePath)) {
        exists = true;
      } else {
        // Fallback check: attempt a standard metadata download call to verify if file exists
        const { data: testDownload, error: testError } = await supabase.storage
          .from(bucketName)
          .download(filePath);
        
        if (!testError && testDownload) {
          exists = true;
        } else {
          console.error(`[DOWNLOAD ERROR] File verification failed for path "${filePath}":`, testError?.message || 'File not found in storage');
        }
      }

      if (!exists) {
        console.error(`[DOWNLOAD ERROR] Missing file. File not found in bucket "${bucketName}" for path: "${filePath}"`);
        return res.status(404).json({ error: "Certificate not found." });
      }

      // 2. Generate a valid signed URL (this satisfies refreshing expired URLs automatically by creating a fresh token)
      console.log(`[DOWNLOAD] Generating a valid signed URL for path: ${filePath}`);
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour validity

      if (signedError || !signedData || !signedData.signedUrl) {
        console.error(`[DOWNLOAD ERROR] Signed URL generation failed or expired:`, signedError?.message);
        return res.status(500).json({ error: "Certificate download failed." });
      }

      const freshSignedUrl = signedData.signedUrl;
      console.log(`[DOWNLOAD] Successfully generated fresh signed URL: ${freshSignedUrl}`);

      // If it's a pre-check query, return success response now
      if (isCheckOnly) {
        console.log(`[DOWNLOAD SUCCESS] Pre-check passed for path: ${filePath}`);
        return res.json({ success: true, verified: true });
      }

      // 3. Download the file using Supabase Storage API download method (as requested)
      console.log(`[DOWNLOAD] Fetching file stream from Supabase Storage API...`);
      const { data: blob, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError || !blob) {
        console.error(`[DOWNLOAD ERROR] Supabase Storage API download method failed:`, downloadError?.message);
        return res.status(500).json({ error: "Certificate download failed." });
      }

      // 4. Stream response back to client (with appropriate content disposition)
      const contentType = blob.type || "application/pdf";
      const buffer = Buffer.from(await blob.arrayBuffer());

      console.log(`[DOWNLOAD SUCCESS] Streaming ${buffer.length} bytes. Filename: ${fileName}, Content-Type: ${contentType}`);
      res.setHeader("Content-Type", contentType);
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      return res.send(buffer);

    } catch (err: any) {
      console.error("[DOWNLOAD FATAL ERROR] Download process crashed:", err);
      return res.status(500).json({ error: "Certificate download failed.", details: err.message || String(err) });
    }
  });

  // Serve static uploaded certificates
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve index.html with Vite transformation for development SPA routing fallback
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files, but prevent caching of index.html so users always get the latest version
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (path.basename(filePath) === 'index.html') {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      }
    }));

    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
