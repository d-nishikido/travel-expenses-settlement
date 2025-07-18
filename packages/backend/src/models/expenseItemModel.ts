import { pool } from '../config/database';
import { ExpenseItem } from '../types';

export class ExpenseItemModel {
  static async findByReportId(reportId: string): Promise<ExpenseItem[]> {
    const result = await pool.query(
      `SELECT * FROM expense_items 
       WHERE expense_report_id = $1 
       ORDER BY expense_date DESC, created_at DESC`,
      [reportId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<ExpenseItem | null> {
    const result = await pool.query(
      'SELECT * FROM expense_items WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(itemData: {
    expense_report_id: string;
    category: 'transportation' | 'accommodation' | 'meal' | 'other';
    description: string;
    amount: number;
    receipt_url?: string;
    expense_date: Date;
  }): Promise<ExpenseItem> {
    const { expense_report_id, category, description, amount, receipt_url, expense_date } = itemData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create the item
      const result = await client.query(
        `INSERT INTO expense_items 
         (expense_report_id, category, description, amount, receipt_url, expense_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [expense_report_id, category, description, amount, receipt_url, expense_date]
      );
      
      const item = result.rows[0];
      
      // Update report total
      await client.query(
        `UPDATE expense_reports 
         SET total_amount = (
           SELECT COALESCE(SUM(amount), 0) 
           FROM expense_items 
           WHERE expense_report_id = $1
         ),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [expense_report_id]
      );
      
      await client.query('COMMIT');
      return item;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(
    id: string,
    itemData: {
      category?: 'transportation' | 'accommodation' | 'meal' | 'other';
      description?: string;
      amount?: number;
      receipt_url?: string;
      expense_date?: Date;
    }
  ): Promise<ExpenseItem | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(itemData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      values.push(id);
      
      // Update the item
      const updateResult = await client.query(
        `UPDATE expense_items 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );
      
      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      const item = updateResult.rows[0];
      
      // Update report total if amount was changed
      if (itemData.amount !== undefined) {
        await client.query(
          `UPDATE expense_reports 
           SET total_amount = (
             SELECT COALESCE(SUM(amount), 0) 
             FROM expense_items 
             WHERE expense_report_id = $1
           ),
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [item.expense_report_id]
        );
      }
      
      await client.query('COMMIT');
      return item;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id: string): Promise<{ deleted: boolean; reportId?: string }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the item to find the report ID
      const itemResult = await client.query(
        'SELECT expense_report_id FROM expense_items WHERE id = $1',
        [id]
      );
      
      if (itemResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { deleted: false };
      }
      
      const reportId = itemResult.rows[0].expense_report_id;
      
      // Delete the item
      const deleteResult = await client.query(
        'DELETE FROM expense_items WHERE id = $1',
        [id]
      );
      
      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return { deleted: false };
      }
      
      // Update report total
      await client.query(
        `UPDATE expense_reports 
         SET total_amount = (
           SELECT COALESCE(SUM(amount), 0) 
           FROM expense_items 
           WHERE expense_report_id = $1
         ),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [reportId]
      );
      
      await client.query('COMMIT');
      return { deleted: true, reportId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async canModifyItem(itemId: string, reportId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT er.status 
       FROM expense_items ei
       JOIN expense_reports er ON ei.expense_report_id = er.id
       WHERE ei.id = $1 AND ei.expense_report_id = $2`,
      [itemId, reportId]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    // Can only modify items in draft reports
    return result.rows[0].status === 'draft';
  }

  static async getTotalByCategory(reportId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM expense_items
       WHERE expense_report_id = $1
       GROUP BY category
       ORDER BY category`,
      [reportId]
    );
    
    return result.rows;
  }
}