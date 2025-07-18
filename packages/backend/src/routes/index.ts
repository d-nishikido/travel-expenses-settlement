import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import expenseReportRoutes from './expenseReports';
import expenseItemRoutes from './expenseItems';
import reportRoutes from './reports';
import { authLimiter, expenseReportLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();

// Mount routes with specific rate limiting
router.use('/auth', authLimiter, authRoutes);
router.use('/users', adminLimiter, userRoutes);
router.use('/expense-reports', expenseReportLimiter, expenseReportRoutes);
router.use('/expense-reports', expenseReportLimiter, expenseItemRoutes);
router.use('/reports', adminLimiter, reportRoutes);

export default router;