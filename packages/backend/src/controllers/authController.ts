import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    // Since we're using JWT, we don't need to do anything server-side
    // The client should remove the token
    ResponseUtil.success(res, null, 'Logout successful');
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const user = await AuthService.getUserById(req.user.userId);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}