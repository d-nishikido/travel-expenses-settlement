import { TestExpenseItem } from '../utils/testHelpers';
import { testExpenseReports } from './expenseReports';

export const testExpenseItems: Record<string, TestExpenseItem> = {
  transportation: {
    id: 'test-item-transport-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'transportation',
    description: 'Shinkansen ticket Tokyo-Osaka round trip',
    amount: 28000,
    expense_date: '2024-01-15',
  },
  accommodation: {
    id: 'test-item-hotel-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'accommodation',
    description: 'Hotel stay (2 nights)',
    amount: 85000,
    expense_date: '2024-01-15',
  },
  meal: {
    id: 'test-item-meal-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'meal',
    description: 'Business dinner with client',
    amount: 15000,
    expense_date: '2024-01-16',
  },
  other: {
    id: 'test-item-other-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'other',
    description: 'Conference registration fee',
    amount: 22000,
    expense_date: '2024-01-17',
  },
  multipleItems: [
    {
      id: 'test-item-multiple-1',
      expense_report_id: testExpenseReports.submitted.id,
      category: 'transportation',
      description: 'Airport transfer',
      amount: 8000,
      expense_date: '2024-01-10',
    },
    {
      id: 'test-item-multiple-2',
      expense_report_id: testExpenseReports.submitted.id,
      category: 'meal',
      description: 'Lunch meeting',
      amount: 12000,
      expense_date: '2024-01-11',
    },
    {
      id: 'test-item-multiple-3',
      expense_report_id: testExpenseReports.submitted.id,
      category: 'accommodation',
      description: 'Business hotel (1 night)',
      amount: 45000,
      expense_date: '2024-01-10',
    },
  ],
};

export const invalidExpenseItems = {
  missingDescription: {
    id: 'test-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'transportation',
    amount: 10000,
    expense_date: '2024-01-15',
  },
  invalidCategory: {
    id: 'test-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'invalid-category',
    description: 'Test item',
    amount: 10000,
    expense_date: '2024-01-15',
  },
  negativeAmount: {
    id: 'test-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'transportation',
    description: 'Test item',
    amount: -10000,
    expense_date: '2024-01-15',
  },
  invalidDate: {
    id: 'test-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'transportation',
    description: 'Test item',
    amount: 10000,
    expense_date: 'invalid-date',
  },
  emptyDescription: {
    id: 'test-id',
    expense_report_id: testExpenseReports.draft.id,
    category: 'transportation',
    description: '',
    amount: 10000,
    expense_date: '2024-01-15',
  },
};