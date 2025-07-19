import { Router } from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router: Router = Router();

// Validation rules
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(['employee', 'accounting'])
    .withMessage('Role must be either employee or accounting'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
];

const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['employee', 'accounting'])
    .withMessage('Role must be either employee or accounting'),
];

const updatePasswordValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => value !== req.body.oldPassword)
    .withMessage('New password must be different from the current password'),
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
];

// Routes
router.get('/', authenticate, authorize('accounting'), UserController.getAllUsers);
router.get('/:id', authenticate, validate(idValidation), UserController.getUserById);
router.post('/', authenticate, authorize('accounting'), validate(createUserValidation), UserController.createUser);
router.put('/:id', authenticate, validate(updateUserValidation), UserController.updateUser);
router.put('/:id/password', authenticate, validate(updatePasswordValidation), UserController.updatePassword);
router.delete('/:id', authenticate, authorize('accounting'), validate(idValidation), UserController.deleteUser);

export default router;