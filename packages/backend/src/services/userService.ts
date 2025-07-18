import { UserModel } from '../models/userModel';
import { AuthService } from './authService';
import { AppError } from '../middleware/errorHandler';
import { User } from '../types';
import logger from '../utils/logger';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return UserModel.findAll();
  }

  static async getUserById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return user;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'employee' | 'accounting';
    department?: string;
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(400, 'DUPLICATE_EMAIL', 'Email already exists');
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(userData.password);

    // Create user
    const user = await UserModel.create({
      ...userData,
      password: hashedPassword,
    });

    logger.info('User created successfully', { userId: user.id, email: user.email });
    return user;
  }

  static async updateUser(
    id: string,
    updateData: {
      name?: string;
      department?: string;
      role?: 'employee' | 'accounting';
    },
    currentUserId: string,
    currentUserRole: string
  ): Promise<User> {
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Only accounting can change roles
    if (updateData.role && currentUserRole !== 'accounting') {
      throw new AppError(403, 'FORBIDDEN', 'Only accounting can change user roles');
    }

    // Users can only update their own profile unless they are accounting
    if (id !== currentUserId && currentUserRole !== 'accounting') {
      throw new AppError(403, 'FORBIDDEN', 'You can only update your own profile');
    }

    const updatedUser = await UserModel.update(id, updateData);
    if (!updatedUser) {
      throw new AppError(500, 'UPDATE_FAILED', 'Failed to update user');
    }

    logger.info('User updated successfully', { userId: id, updatedBy: currentUserId });
    return updatedUser;
  }

  static async updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    currentUserId: string
  ): Promise<void> {
    // Users can only update their own password
    if (id !== currentUserId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only update your own password');
    }

    // Verify old password
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    try {
      // Need to get user with password for verification
      await AuthService.login(user.email, oldPassword);
    } catch {
      throw new AppError(401, 'INVALID_PASSWORD', 'Invalid current password');
    }

    // Hash new password and update
    const hashedPassword = await AuthService.hashPassword(newPassword);
    const updated = await UserModel.updatePassword(id, hashedPassword);
    
    if (!updated) {
      throw new AppError(500, 'UPDATE_FAILED', 'Failed to update password');
    }

    logger.info('Password updated successfully', { userId: id });
  }

  static async deleteUser(id: string): Promise<void> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const deleted = await UserModel.delete(id);
    if (!deleted) {
      throw new AppError(500, 'DELETE_FAILED', 'Failed to delete user');
    }

    logger.info('User deleted successfully', { userId: id });
  }
}