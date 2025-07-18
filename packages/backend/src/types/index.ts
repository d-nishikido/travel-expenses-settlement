export type UserRole = 'employee' | 'accounting';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type ExpenseCategory = 'transportation' | 'accommodation' | 'meal' | 'other';

export type ApprovalAction = 'submitted' | 'approved' | 'rejected' | 'paid';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseReport {
  id: string;
  user_id: string;
  title: string;
  trip_purpose: string;
  trip_start_date: Date;
  trip_end_date: Date;
  status: ExpenseStatus;
  total_amount: number;
  submitted_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseItem {
  id: string;
  expense_report_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt_url?: string;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalHistory {
  id: string;
  expense_report_id: string;
  action: ApprovalAction;
  user_id: string;
  comment?: string;
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
}