import { Router } from 'express';
import { body, param } from 'express-validator';
import { ExpenseItemController } from '../controllers/expenseItemController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const reportIdValidation = [
  param('reportId').isUUID().withMessage('Invalid expense report ID'),
];

const itemIdValidation = [
  param('itemId').isUUID().withMessage('Invalid expense item ID'),
];

const createItemValidation = [
  ...reportIdValidation,
  body('category')
    .isIn(['transportation', 'accommodation', 'meal', 'other'])
    .withMessage('Category must be transportation, accommodation, meal, or other'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      return true;
    }),
  body('receipt_url')
    .optional()
    .isURL()
    .withMessage('Receipt URL must be a valid URL'),
  body('expense_date')
    .isISO8601()
    .toDate()
    .withMessage('Valid expense date is required')
    .custom(value => {
      if (new Date(value) > new Date()) {
        throw new Error('Expense date cannot be in the future');
      }
      return true;
    }),
];

const updateItemValidation = [
  ...reportIdValidation,
  ...itemIdValidation,
  body('category')
    .optional()
    .isIn(['transportation', 'accommodation', 'meal', 'other'])
    .withMessage('Category must be transportation, accommodation, meal, or other'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => {
      if (value !== undefined && parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      return true;
    }),
  body('receipt_url')
    .optional()
    .isURL()
    .withMessage('Receipt URL must be a valid URL'),
  body('expense_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid expense date is required')
    .custom(value => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Expense date cannot be in the future');
      }
      return true;
    }),
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/:reportId/items', validate(reportIdValidation), ExpenseItemController.getItemsByReport);
router.get('/:reportId/items/summary', validate(reportIdValidation), ExpenseItemController.getCategorySummary);
router.get('/:reportId/items/:itemId', validate([...reportIdValidation, ...itemIdValidation]), ExpenseItemController.getItemById);
router.post('/:reportId/items', validate(createItemValidation), ExpenseItemController.createItem);
router.put('/:reportId/items/:itemId', validate(updateItemValidation), ExpenseItemController.updateItem);
router.delete('/:reportId/items/:itemId', validate([...reportIdValidation, ...itemIdValidation]), ExpenseItemController.deleteItem);

export default router;