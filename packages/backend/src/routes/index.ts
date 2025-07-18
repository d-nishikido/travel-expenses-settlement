import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import expenseReportRoutes from './expenseReports';
import expenseItemRoutes from './expenseItems';
import reportRoutes from './reports';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expense-reports', expenseReportRoutes);
router.use('/expense-reports', expenseItemRoutes);
router.use('/reports', reportRoutes);

export default router;