import { pool } from '../config/database';
import { ApprovalHistory } from '../types';

export class ApprovalHistoryModel {
  static async create(historyData: {
    expense_report_id: string;
    action: 'submitted' | 'approved' | 'rejected' | 'paid';
    user_id: string;
    comment?: string;
  }): Promise<ApprovalHistory> {
    const { expense_report_id, action, user_id, comment } = historyData;
    
    const result = await pool.query(
      `INSERT INTO approval_history (expense_report_id, action, user_id, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [expense_report_id, action, user_id, comment]
    );
    
    return result.rows[0];
  }

  static async findByReportId(reportId: string): Promise<ApprovalHistory[]> {
    const result = await pool.query(
      `SELECT ah.*, u.name as user_name, u.email as user_email
       FROM approval_history ah
       JOIN users u ON ah.user_id = u.id
       WHERE ah.expense_report_id = $1
       ORDER BY ah.created_at DESC`,
      [reportId]
    );
    
    return result.rows;
  }

  static async getLatestAction(reportId: string): Promise<ApprovalHistory | null> {
    const result = await pool.query(
      `SELECT ah.*, u.name as user_name, u.email as user_email
       FROM approval_history ah
       JOIN users u ON ah.user_id = u.id
       WHERE ah.expense_report_id = $1
       ORDER BY ah.created_at DESC
       LIMIT 1`,
      [reportId]
    );
    
    return result.rows[0] || null;
  }
}