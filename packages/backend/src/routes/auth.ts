import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router: Router = Router();

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/login', validate(loginValidation), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;