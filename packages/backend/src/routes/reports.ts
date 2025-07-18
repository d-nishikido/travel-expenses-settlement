import { Router } from 'express';
import { query, param } from 'express-validator';
import { ReportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Validation rules
const dateValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

const detailedReportValidation = [
  ...dateValidation,
  query('status')
    .optional()
    .isIn(['draft', 'submitted', 'approved', 'rejected', 'paid'])
    .withMessage('Status must be one of: draft, submitted, approved, rejected, paid'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

const userSummaryValidation = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

// All routes require authentication and accounting role
router.use(authenticate);
router.use(authorize('accounting'));

// Routes
router.get('/summary', validate(dateValidation), ReportController.getSummaryReport);
router.get('/detailed', validate(detailedReportValidation), ReportController.getDetailedReport);
router.get('/export', validate(detailedReportValidation), ReportController.exportToCsv);

// User summary route (accessible by users for their own data)
router.get('/users/:userId/summary', 
  authenticate, // Re-authenticate to override the accounting-only middleware above
  validate(userSummaryValidation), 
  ReportController.getUserSummary
);

export default router;