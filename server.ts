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
    tableName: 'certificates',
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route: Get Active Supabase Configuration
  app.get("/api/config", (req, res) => {
    const config = loadSupabaseConfig();
    res.json(config);
  });

  // API Route: Save Active Supabase Configuration
  app.post("/api/config", (req, res) => {
    const config = req.body;
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      return res.status(400).json({ error: "supabaseUrl and supabaseAnonKey are required" });
    }
    const newConfig = {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      storageBucket: config.storageBucket || 'certificates',
      tableName: config.tableName || 'certificates',
    };
    saveSupabaseConfig(newConfig);
    res.json({ success: true, config: newConfig });
  });

  // API Route: Delete/Clear Active Supabase Configuration
  app.delete("/api/config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        fs.unlinkSync(CONFIG_FILE_PATH);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to clear configuration file" });
    }
  });

  // API Route: Get All Local Fallback Certificates
  app.get("/api/certificates", (req, res) => {
    const certs = loadLocalCertificates();
    res.json(certs);
  });

  // API Route: Save/Update Local Fallback Certificates List
  app.post("/api/certificates", (req, res) => {
    const certs = req.body;
    if (Array.isArray(certs)) {
      saveLocalCertificates(certs);
      res.json({ success: true, count: certs.length });
    } else {
      res.status(400).json({ error: "Expected an array of certificates" });
    }
  });

  // API Route: Add or Update a single certificate in Local Fallback List
  app.post("/api/certificates/single", (req, res) => {
    const newCert = req.body;
    if (!newCert.id || !newCert.hall_ticket_number || !newCert.student_name) {
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
    res.json({ success: true, certificate: newCert });
  });

  // API Route: Delete a single certificate in Local Fallback List
  app.delete("/api/certificates/:id", (req, res) => {
    const { id } = req.params;
    const certs = loadLocalCertificates();
    const filtered = certs.filter((c: any) => c.id !== id);
    saveLocalCertificates(filtered);
    res.json({ success: true });
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
