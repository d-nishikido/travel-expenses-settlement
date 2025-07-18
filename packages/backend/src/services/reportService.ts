import { pool } from '../config/database';

export interface ReportSummary {
  totalReports: number;
  totalAmount: number;
  byStatus: {
    draft: { count: number; amount: number };
    submitted: { count: number; amount: number };
    approved: { count: number; amount: number };
    rejected: { count: number; amount: number };
    paid: { count: number; amount: number };
  };
  byCategory: {
    transportation: number;
    accommodation: number;
    meal: number;
    other: number;
  };
  recentActivity: any[];
}

export class ReportService {
  static async getSummaryReport(
    startDate?: string,
    endDate?: string
  ): Promise<ReportSummary> {
    let dateFilter = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE er.created_at >= $1 AND er.created_at <= $2';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE er.created_at >= $1';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE er.created_at <= $1';
      params.push(endDate);
    }

    // Get overall summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_reports,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM expense_reports er
      ${dateFilter}
    `;
    
    const summaryResult = await pool.query(summaryQuery, params);
    const { total_reports, total_amount } = summaryResult.rows[0];

    // Get summary by status
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM expense_reports er
      ${dateFilter}
      GROUP BY status
    `;
    
    const statusResult = await pool.query(statusQuery, params);
    
    const byStatus = {
      draft: { count: 0, amount: 0 },
      submitted: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
    };
    
    statusResult.rows.forEach(row => {
      byStatus[row.status as keyof typeof byStatus] = {
        count: parseInt(row.count),
        amount: parseFloat(row.amount),
      };
    });

    // Get summary by category
    const categoryQuery = `
      SELECT 
        ei.category,
        COALESCE(SUM(ei.amount), 0) as total
      FROM expense_items ei
      JOIN expense_reports er ON ei.expense_report_id = er.id
      ${dateFilter}
      GROUP BY ei.category
    `;
    
    const categoryResult = await pool.query(categoryQuery, params);
    
    const byCategory = {
      transportation: 0,
      accommodation: 0,
      meal: 0,
      other: 0,
    };
    
    categoryResult.rows.forEach(row => {
      byCategory[row.category as keyof typeof byCategory] = parseFloat(row.total);
    });

    // Get recent activity (last 10 status changes)
    const activityQuery = `
      SELECT 
        ah.action,
        ah.created_at,
        ah.comment,
        u.name as user_name,
        er.title as report_title,
        er.id as report_id
      FROM approval_history ah
      JOIN users u ON ah.user_id = u.id
      JOIN expense_reports er ON ah.expense_report_id = er.id
      ORDER BY ah.created_at DESC
      LIMIT 10
    `;
    
    const activityResult = await pool.query(activityQuery);

    return {
      totalReports: parseInt(total_reports),
      totalAmount: parseFloat(total_amount),
      byStatus,
      byCategory,
      recentActivity: activityResult.rows,
    };
  }

  static async getDetailedReport(
    status?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`er.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (userId) {
      whereConditions.push(`er.user_id = $${paramCount}`);
      params.push(userId);
      paramCount++;
    }

    if (startDate) {
      whereConditions.push(`er.created_at >= $${paramCount}`);
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereConditions.push(`er.created_at <= $${paramCount}`);
      params.push(endDate);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        er.id,
        er.title,
        er.trip_purpose,
        er.trip_start_date,
        er.trip_end_date,
        er.status,
        er.total_amount,
        er.submitted_at,
        er.approved_at,
        er.created_at,
        u.name as user_name,
        u.email as user_email,
        u.department,
        approver.name as approver_name
      FROM expense_reports er
      JOIN users u ON er.user_id = u.id
      LEFT JOIN users approver ON er.approved_by = approver.id
      ${whereClause}
      ORDER BY er.created_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async exportToCsv(
    status?: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<string> {
    const reports = await this.getDetailedReport(status, userId, startDate, endDate);
    
    // CSV headers
    const headers = [
      'ID',
      'Title',
      'User Name',
      'User Email',
      'Department',
      'Trip Purpose',
      'Start Date',
      'End Date',
      'Status',
      'Total Amount',
      'Submitted At',
      'Approved At',
      'Approver Name',
      'Created At'
    ];

    // Convert data to CSV format
    const csvRows = [
      headers.join(','),
      ...reports.map(report => [
        report.id,
        `"${report.title}"`,
        `"${report.user_name}"`,
        report.user_email,
        `"${report.department || ''}"`,
        `"${report.trip_purpose}"`,
        report.trip_start_date,
        report.trip_end_date,
        report.status,
        report.total_amount,
        report.submitted_at || '',
        report.approved_at || '',
        `"${report.approver_name || ''}"`,
        report.created_at
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  static async getUserExpenseSummary(userId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_reports,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
      FROM expense_reports
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}