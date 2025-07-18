import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { User, JWTPayload } from '../types';
import logger from '../utils/logger';

export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string; user: Partial<User> }> {
    try {
      const result = await pool.query(
        'SELECT id, email, password, name, role, department FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
      }

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { password: _, ...userWithoutPassword } = user;

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<Partial<User>> {
    const result = await pool.query(
      'SELECT id, email, name, role, department, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return result.rows[0];
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload as object, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}