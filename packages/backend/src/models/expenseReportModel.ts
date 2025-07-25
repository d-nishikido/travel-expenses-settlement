import { pool } from '../config/database';
import { ExpenseReport } from '../types';

export class ExpenseReportModel {
  static async findAll(userId?: string, role?: string): Promise<ExpenseReport[]> {
    let query = `
      SELECT er.*, u.name as user_name, u.email as user_email,
             approver.name as approver_name,
             COALESCE(item_totals.calculated_total, 0) as total_amount
      FROM expense_reports er
      JOIN users u ON er.user_id = u.id
      LEFT JOIN users approver ON er.approved_by = approver.id
      LEFT JOIN (
        SELECT expense_report_id, SUM(amount) as calculated_total
        FROM expense_items
        GROUP BY expense_report_id
      ) item_totals ON er.id = item_totals.expense_report_id
    `;
    
    const values: any[] = [];
    
    // If not accounting, only show own reports
    if (role !== 'accounting' && userId) {
      query += ' WHERE er.user_id = $1';
      values.push(userId);
    }
    
    query += ' ORDER BY er.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id: string, userId?: string, role?: string): Promise<ExpenseReport | null> {
    let query = `
      SELECT er.*, u.name as user_name, u.email as user_email,
             approver.name as approver_name,
             COALESCE(item_totals.calculated_total, 0) as total_amount
      FROM expense_reports er
      JOIN users u ON er.user_id = u.id
      LEFT JOIN users approver ON er.approved_by = approver.id
      LEFT JOIN (
        SELECT expense_report_id, SUM(amount) as calculated_total
        FROM expense_items
        GROUP BY expense_report_id
      ) item_totals ON er.id = item_totals.expense_report_id
      WHERE er.id = $1
    `;
    
    const values: any[] = [id];
    
    // If not accounting, only show own reports
    if (role !== 'accounting' && userId) {
      query += ' AND er.user_id = $2';
      values.push(userId);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async create(reportData: {
    user_id: string;
    title: string;
    trip_purpose: string;
    trip_start_date: Date;
    trip_end_date: Date;
  }): Promise<ExpenseReport> {
    const { user_id, title, trip_purpose, trip_start_date, trip_end_date } = reportData;
    
    const result = await pool.query(
      `INSERT INTO expense_reports 
       (user_id, title, trip_purpose, trip_start_date, trip_end_date, status, total_amount)
       VALUES ($1, $2, $3, $4, $5, 'draft', 0)
       RETURNING *`,
      [user_id, title, trip_purpose, trip_start_date, trip_end_date]
    );
    
    return result.rows[0];
  }

  static async update(
    id: string,
    reportData: {
      title?: string;
      trip_purpose?: string;
      trip_start_date?: Date;
      trip_end_date?: Date;
    }
  ): Promise<ExpenseReport | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(reportData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    
    const query = `
      UPDATE expense_reports 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND status = 'draft'
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updateStatus(
    id: string,
    status: string,
    approved_by?: string
  ): Promise<ExpenseReport | null> {
    let query = `
      UPDATE expense_reports 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    
    const values: any[] = [status];
    let paramCount = 2;

    if (status === 'submitted') {
      query += `, submitted_at = CURRENT_TIMESTAMP`;
    }

    if ((status === 'approved' || status === 'rejected') && approved_by) {
      query += `, approved_at = CURRENT_TIMESTAMP, approved_by = $${paramCount}`;
      values.push(approved_by);
      paramCount++;
    }

    values.push(id);
    query += ` WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updateTotalAmount(id: string): Promise<ExpenseReport | null> {
    const query = `
      UPDATE expense_reports er
      SET total_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM expense_items
        WHERE expense_report_id = er.id
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM expense_reports WHERE id = $1 AND status = \'draft\'',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async canUserAccess(reportId: string, userId: string, role: string): Promise<boolean> {
    if (role === 'accounting') {
      return true;
    }

    const result = await pool.query(
      'SELECT 1 FROM expense_reports WHERE id = $1 AND user_id = $2',
      [reportId, userId]
    );
    
    return result.rows.length > 0;
  }
}