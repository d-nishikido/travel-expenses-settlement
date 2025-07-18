export type UserRole = 'employee' | 'accounting';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type ExpenseCategory = 'transportation' | 'accommodation' | 'meal' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseReport {
  id: string;
  user_id: string;
  title: string;
  trip_purpose: string;
  trip_start_date: string;
  trip_end_date: string;
  status: ExpenseStatus;
  total_amount: number;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseItem {
  id: string;
  expense_report_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt_url?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApprovalHistory {
  id: string;
  expense_report_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'paid';
  user_id: string;
  comment?: string;
  created_at: string;
}

export interface ApiError {
  message: string;
  status: number;
}