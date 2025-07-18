import { Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class ReportController {
  static async getSummaryReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const summary = await ReportService.getSummaryReport(
        startDate as string,
        endDate as string
      );
      
      ResponseUtil.success(res, summary);
    } catch (error) {
      next(error);
    }
  }

  static async getDetailedReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, userId, startDate, endDate } = req.query;
      
      const reports = await ReportService.getDetailedReport(
        status as string,
        userId as string,
        startDate as string,
        endDate as string
      );
      
      ResponseUtil.success(res, reports);
    } catch (error) {
      next(error);
    }
  }

  static async exportToCsv(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, userId, startDate, endDate } = req.query;
      
      const csvData = await ReportService.exportToCsv(
        status as string,
        userId as string,
        startDate as string,
        endDate as string
      );
      
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expense_reports.csv"');
      
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }

  static async getUserSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { userId } = req.params;
      
      // Users can only view their own summary unless they're accounting
      const targetUserId = req.user.role === 'accounting' ? userId : req.user.userId;
      
      const summary = await ReportService.getUserExpenseSummary(targetUserId);
      
      ResponseUtil.success(res, summary);
    } catch (error) {
      next(error);
    }
  }
}