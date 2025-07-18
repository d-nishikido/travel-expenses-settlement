import { Response, NextFunction } from 'express';
import { ExpenseItemService } from '../services/expenseItemService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class ExpenseItemController {
  static async getItemsByReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId } = req.params;
      const items = await ExpenseItemService.getItemsByReportId(
        reportId,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, items);
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId, itemId } = req.params;
      const item = await ExpenseItemService.getItemById(
        reportId,
        itemId,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, item);
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId } = req.params;
      const { category, description, amount, receipt_url, expense_date } = req.body;
      
      const item = await ExpenseItemService.createItem(
        reportId,
        {
          category,
          description,
          amount: parseFloat(amount),
          receipt_url,
          expense_date,
        },
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.created(res, item, 'Expense item created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId, itemId } = req.params;
      const { category, description, amount, receipt_url, expense_date } = req.body;
      
      const updateData: any = {};
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (receipt_url !== undefined) updateData.receipt_url = receipt_url;
      if (expense_date !== undefined) updateData.expense_date = expense_date;
      
      const item = await ExpenseItemService.updateItem(
        reportId,
        itemId,
        updateData,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, item, 'Expense item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId, itemId } = req.params;
      
      await ExpenseItemService.deleteItem(
        reportId,
        itemId,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  static async getCategorySummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const { reportId } = req.params;
      const summary = await ExpenseItemService.getCategorySummary(
        reportId,
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, summary);
    } catch (error) {
      next(error);
    }
  }
}