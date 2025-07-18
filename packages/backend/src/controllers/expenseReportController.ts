import { Response, NextFunction } from 'express';
import { ExpenseReportService } from '../services/expenseReportService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class ExpenseReportController {
  static async getAllReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const reports = await ExpenseReportService.getAllReports(
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, reports);
    } catch (error) {
      next(error);
    }
  }

  static async getReportById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      const report = await ExpenseReportService.getReportById(
        id,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, report);
    } catch (error) {
      next(error);
    }
  }

  static async createReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { title, trip_purpose, trip_start_date, trip_end_date } = req.body;
      
      const report = await ExpenseReportService.createReport({
        title,
        trip_purpose,
        trip_start_date,
        trip_end_date,
        user_id: req.user.userId,
      });
      
      ResponseUtil.created(res, report, 'Expense report created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      const { title, trip_purpose, trip_start_date, trip_end_date } = req.body;
      
      const report = await ExpenseReportService.updateReport(
        id,
        { title, trip_purpose, trip_start_date, trip_end_date },
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, report, 'Expense report updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      
      await ExpenseReportService.deleteReport(
        id,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  static async submitReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      
      const report = await ExpenseReportService.submitReport(
        id,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, report, 'Expense report submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async approveReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      const { comment } = req.body;
      
      const report = await ExpenseReportService.approveReport(
        id,
        comment,
        req.user.userId
      );
      
      ResponseUtil.success(res, report, 'Expense report approved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async rejectReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      const { comment } = req.body;
      
      const report = await ExpenseReportService.rejectReport(
        id,
        comment,
        req.user.userId
      );
      
      ResponseUtil.success(res, report, 'Expense report rejected successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsPaid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      const { comment } = req.body;
      
      const report = await ExpenseReportService.markAsPaid(
        id,
        comment,
        req.user.userId
      );
      
      ResponseUtil.success(res, report, 'Expense report marked as paid');
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { id } = req.params;
      
      // First check if user can access the report
      await ExpenseReportService.getReportById(
        id,
        req.user.userId,
        req.user.role
      );
      
      const history = await ExpenseReportService.getApprovalHistory(id);
      
      ResponseUtil.success(res, history);
    } catch (error) {
      next(error);
    }
  }
}