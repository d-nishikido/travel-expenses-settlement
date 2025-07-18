import { ExpenseReportModel } from '../models/expenseReportModel';
import { ApprovalHistoryModel } from '../models/approvalHistoryModel';
import { AppError } from '../middleware/errorHandler';
import { ExpenseReport } from '../types';
import logger from '../utils/logger';
import { pool } from '../config/database';

export class ExpenseReportService {
  static async getAllReports(userId: string, role: string): Promise<ExpenseReport[]> {
    return ExpenseReportModel.findAll(userId, role);
  }

  static async getReportById(id: string, userId: string, role: string): Promise<ExpenseReport> {
    const report = await ExpenseReportModel.findById(id, userId, role);
    
    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
    }
    
    return report;
  }

  static async createReport(reportData: {
    title: string;
    trip_purpose: string;
    trip_start_date: Date;
    trip_end_date: Date;
    user_id: string;
  }): Promise<ExpenseReport> {
    // Validate dates
    if (new Date(reportData.trip_end_date) < new Date(reportData.trip_start_date)) {
      throw new AppError(400, 'INVALID_DATES', 'End date must be after start date');
    }

    const report = await ExpenseReportModel.create(reportData);
    
    logger.info('Expense report created', { reportId: report.id, userId: reportData.user_id });
    return report;
  }

  static async updateReport(
    id: string,
    updateData: {
      title?: string;
      trip_purpose?: string;
      trip_start_date?: Date;
      trip_end_date?: Date;
    },
    userId: string,
    role: string
  ): Promise<ExpenseReport> {
    // Check access
    const canAccess = await ExpenseReportModel.canUserAccess(id, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    // Validate dates if both are provided
    if (updateData.trip_start_date && updateData.trip_end_date) {
      if (new Date(updateData.trip_end_date) < new Date(updateData.trip_start_date)) {
        throw new AppError(400, 'INVALID_DATES', 'End date must be after start date');
      }
    }

    const updatedReport = await ExpenseReportModel.update(id, updateData);
    
    if (!updatedReport) {
      throw new AppError(400, 'UPDATE_FAILED', 'Cannot update submitted report');
    }

    logger.info('Expense report updated', { reportId: id, userId });
    return updatedReport;
  }

  static async deleteReport(id: string, userId: string, role: string): Promise<void> {
    // Check access
    const canAccess = await ExpenseReportModel.canUserAccess(id, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    const deleted = await ExpenseReportModel.delete(id);
    
    if (!deleted) {
      throw new AppError(400, 'DELETE_FAILED', 'Cannot delete submitted report');
    }

    logger.info('Expense report deleted', { reportId: id, userId });
  }

  static async submitReport(id: string, userId: string, role: string): Promise<ExpenseReport> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check access
      const report = await ExpenseReportModel.findById(id, userId, role);
      if (!report) {
        throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
      }

      if (report.user_id !== userId) {
        throw new AppError(403, 'FORBIDDEN', 'You can only submit your own reports');
      }

      if (report.status !== 'draft') {
        throw new AppError(400, 'INVALID_STATUS', 'Only draft reports can be submitted');
      }

      // Check if report has items
      const itemsResult = await client.query(
        'SELECT COUNT(*) as count FROM expense_items WHERE expense_report_id = $1',
        [id]
      );
      
      if (parseInt(itemsResult.rows[0].count) === 0) {
        throw new AppError(400, 'NO_ITEMS', 'Cannot submit report without expense items');
      }

      // Update status
      const updatedReport = await ExpenseReportModel.updateStatus(id, 'submitted');
      
      if (!updatedReport) {
        throw new AppError(500, 'UPDATE_FAILED', 'Failed to submit report');
      }

      // Add to approval history
      await ApprovalHistoryModel.create({
        expense_report_id: id,
        action: 'submitted',
        user_id: userId,
      });

      await client.query('COMMIT');
      
      logger.info('Expense report submitted', { reportId: id, userId });
      return updatedReport;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async approveReport(
    id: string,
    comment: string | undefined,
    approverId: string
  ): Promise<ExpenseReport> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const report = await ExpenseReportModel.findById(id);
      if (!report) {
        throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
      }

      if (report.status !== 'submitted') {
        throw new AppError(400, 'INVALID_STATUS', 'Only submitted reports can be approved');
      }

      // Update status
      const updatedReport = await ExpenseReportModel.updateStatus(id, 'approved', approverId);
      
      if (!updatedReport) {
        throw new AppError(500, 'UPDATE_FAILED', 'Failed to approve report');
      }

      // Add to approval history
      await ApprovalHistoryModel.create({
        expense_report_id: id,
        action: 'approved',
        user_id: approverId,
        comment,
      });

      await client.query('COMMIT');
      
      logger.info('Expense report approved', { reportId: id, approverId });
      return updatedReport;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async rejectReport(
    id: string,
    comment: string,
    approverId: string
  ): Promise<ExpenseReport> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const report = await ExpenseReportModel.findById(id);
      if (!report) {
        throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
      }

      if (report.status !== 'submitted') {
        throw new AppError(400, 'INVALID_STATUS', 'Only submitted reports can be rejected');
      }

      // Update status
      const updatedReport = await ExpenseReportModel.updateStatus(id, 'rejected', approverId);
      
      if (!updatedReport) {
        throw new AppError(500, 'UPDATE_FAILED', 'Failed to reject report');
      }

      // Add to approval history
      await ApprovalHistoryModel.create({
        expense_report_id: id,
        action: 'rejected',
        user_id: approverId,
        comment,
      });

      await client.query('COMMIT');
      
      logger.info('Expense report rejected', { reportId: id, approverId });
      return updatedReport;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async markAsPaid(
    id: string,
    comment: string | undefined,
    userId: string
  ): Promise<ExpenseReport> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const report = await ExpenseReportModel.findById(id);
      if (!report) {
        throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
      }

      if (report.status !== 'approved') {
        throw new AppError(400, 'INVALID_STATUS', 'Only approved reports can be marked as paid');
      }

      // Update status
      const updatedReport = await ExpenseReportModel.updateStatus(id, 'paid');
      
      if (!updatedReport) {
        throw new AppError(500, 'UPDATE_FAILED', 'Failed to mark report as paid');
      }

      // Add to approval history
      await ApprovalHistoryModel.create({
        expense_report_id: id,
        action: 'paid',
        user_id: userId,
        comment,
      });

      await client.query('COMMIT');
      
      logger.info('Expense report marked as paid', { reportId: id, userId });
      return updatedReport;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getApprovalHistory(reportId: string): Promise<any[]> {
    return ApprovalHistoryModel.findByReportId(reportId);
  }
}