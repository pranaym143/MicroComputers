export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  storageBucket: string;
  tableName: string;
}

export interface StudentCertificate {
  id: string;
  hall_ticket_number: string;
  student_name: string;
  course: string;
  year: string;
  grade?: string;
  issue_date: string;
  certificate_url?: string; // URL of PDF or asset
  file_name?: string; // Store name of uploaded file
  phone_number?: string; // Optional student phone number
  course_name?: string; // Alternative name for course in some schemas
  completion_year?: string; // Alternative name for year in some schemas
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}
