import { ExpenseItemModel } from '../models/expenseItemModel';
import { ExpenseReportModel } from '../models/expenseReportModel';
import { AppError } from '../middleware/errorHandler';
import { ExpenseItem } from '../types';
import logger from '../utils/logger';

export class ExpenseItemService {
  static async getItemsByReportId(reportId: string, userId: string, role: string): Promise<ExpenseItem[]> {
    // Check if user can access the report
    const canAccess = await ExpenseReportModel.canUserAccess(reportId, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    return ExpenseItemModel.findByReportId(reportId);
  }

  static async getItemById(
    reportId: string,
    itemId: string,
    userId: string,
    role: string
  ): Promise<ExpenseItem> {
    // Check if user can access the report
    const canAccess = await ExpenseReportModel.canUserAccess(reportId, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    const item = await ExpenseItemModel.findById(itemId);
    
    if (!item || item.expense_report_id !== reportId) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Expense item not found');
    }

    return item;
  }

  static async createItem(
    reportId: string,
    itemData: {
      category: 'transportation' | 'accommodation' | 'meal' | 'other';
      description: string;
      amount: number;
      receipt_url?: string;
      expense_date: Date;
    },
    userId: string,
    role: string
  ): Promise<ExpenseItem> {
    // Check if user can access the report
    const report = await ExpenseReportModel.findById(reportId, userId, role);
    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'Expense report not found');
    }

    // Only allow modifications to draft reports
    if (report.status !== 'draft') {
      throw new AppError(400, 'INVALID_STATUS', 'Cannot add items to submitted reports');
    }

    // Validate amount
    if (itemData.amount <= 0) {
      throw new AppError(400, 'INVALID_AMOUNT', 'Amount must be greater than zero');
    }

    // Validate expense date is not in the future
    if (new Date(itemData.expense_date) > new Date()) {
      throw new AppError(400, 'INVALID_DATE', 'Expense date cannot be in the future');
    }

    const item = await ExpenseItemModel.create({
      ...itemData,
      expense_report_id: reportId,
    });

    logger.info('Expense item created', { itemId: item.id, reportId, userId });
    return item;
  }

  static async updateItem(
    reportId: string,
    itemId: string,
    updateData: {
      category?: 'transportation' | 'accommodation' | 'meal' | 'other';
      description?: string;
      amount?: number;
      receipt_url?: string;
      expense_date?: Date;
    },
    userId: string,
    role: string
  ): Promise<ExpenseItem> {
    // Check if user can access the report
    const canAccess = await ExpenseReportModel.canUserAccess(reportId, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    // Check if item can be modified
    const canModify = await ExpenseItemModel.canModifyItem(itemId, reportId);
    if (!canModify) {
      throw new AppError(400, 'CANNOT_MODIFY', 'Cannot modify items in submitted reports');
    }

    // Validate amount if provided
    if (updateData.amount !== undefined && updateData.amount <= 0) {
      throw new AppError(400, 'INVALID_AMOUNT', 'Amount must be greater than zero');
    }

    // Validate expense date if provided
    if (updateData.expense_date && new Date(updateData.expense_date) > new Date()) {
      throw new AppError(400, 'INVALID_DATE', 'Expense date cannot be in the future');
    }

    const updatedItem = await ExpenseItemModel.update(itemId, updateData);
    
    if (!updatedItem) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Expense item not found');
    }

    logger.info('Expense item updated', { itemId, reportId, userId });
    return updatedItem;
  }

  static async deleteItem(
    reportId: string,
    itemId: string,
    userId: string,
    role: string
  ): Promise<void> {
    // Check if user can access the report
    const canAccess = await ExpenseReportModel.canUserAccess(reportId, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    // Check if item can be modified
    const canModify = await ExpenseItemModel.canModifyItem(itemId, reportId);
    if (!canModify) {
      throw new AppError(400, 'CANNOT_MODIFY', 'Cannot delete items from submitted reports');
    }

    const result = await ExpenseItemModel.delete(itemId);
    
    if (!result.deleted) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Expense item not found');
    }

    logger.info('Expense item deleted', { itemId, reportId, userId });
  }

  static async getCategorySummary(
    reportId: string,
    userId: string,
    role: string
  ): Promise<any[]> {
    // Check if user can access the report
    const canAccess = await ExpenseReportModel.canUserAccess(reportId, userId, role);
    if (!canAccess) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this report');
    }

    return ExpenseItemModel.getTotalByCategory(reportId);
  }
}