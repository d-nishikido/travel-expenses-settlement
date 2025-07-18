import { Router } from 'express';
import { body, param } from 'express-validator';
import { ExpenseReportController } from '../controllers/expenseReportController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const idValidation = [
  param('id').isUUID().withMessage('Invalid expense report ID'),
];

const createReportValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('trip_purpose')
    .trim()
    .notEmpty()
    .withMessage('Trip purpose is required'),
  body('trip_start_date')
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required'),
  body('trip_end_date')
    .isISO8601()
    .toDate()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.trip_start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const updateReportValidation = [
  ...idValidation,
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('trip_purpose')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Trip purpose cannot be empty'),
  body('trip_start_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required'),
  body('trip_end_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid end date is required'),
];

const approvalValidation = [
  ...idValidation,
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
];

const rejectValidation = [
  ...idValidation,
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required when rejecting')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', ExpenseReportController.getAllReports);
router.get('/:id', validate(idValidation), ExpenseReportController.getReportById);
router.get('/:id/history', validate(idValidation), ExpenseReportController.getApprovalHistory);
router.post('/', validate(createReportValidation), ExpenseReportController.createReport);
router.put('/:id', validate(updateReportValidation), ExpenseReportController.updateReport);
router.delete('/:id', validate(idValidation), ExpenseReportController.deleteReport);
router.post('/:id/submit', validate(idValidation), ExpenseReportController.submitReport);

// Accounting-only routes
router.post(
  '/:id/approve',
  authorize('accounting'),
  validate(approvalValidation),
  ExpenseReportController.approveReport
);
router.post(
  '/:id/reject',
  authorize('accounting'),
  validate(rejectValidation),
  ExpenseReportController.rejectReport
);
router.post(
  '/:id/pay',
  authorize('accounting'),
  validate(approvalValidation),
  ExpenseReportController.markAsPaid
);

export default router;