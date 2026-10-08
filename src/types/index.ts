export type ClientStatus = 'active' | 'completed' | 'pending' | 'inactive';

export type ProjectStatus = 'in_development' | 'live' | 'completed' | 'maintenance' | 'paused';

export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status: ClientStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  client_id: string;
  client_name?: string; // Denormalized for display convenience
  name: string;
  description?: string;
  live_url?: string;
  github_url?: string;
  vercel_url?: string;
  server_url?: string;
  admin_url?: string;
  image_url?: string;
  tech_stack: string[];
  status: ProjectStatus;
  notes?: string;
  // Payments & Receivables
  total_price: number;
  amount_paid: number;
  remaining_amount: number; // total_price - amount_paid
  payment_status: PaymentStatus;
  currency: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentLog {
  id: string;
  project_id: string;
  client_id: string;
  amount: number;
  date: string;
  note?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  activeProjects: number;
  completedProjects: number;
  totalReceivables: number; // Total outstanding balance
  totalInvoiced: number;
  totalCollected: number;
}
