import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  static async getAllUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      ResponseUtil.success(res, users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role, department } = req.body;
      const user = await UserService.createUser({
        email,
        password,
        name,
        role,
        department,
      });
      ResponseUtil.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, department, role } = req.body;

      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const user = await UserService.updateUser(
        id,
        { name, department, role },
        req.user.userId,
        req.user.role
      );
      
      ResponseUtil.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      await UserService.updatePassword(id, oldPassword, newPassword, req.user.userId);
      ResponseUtil.success(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}