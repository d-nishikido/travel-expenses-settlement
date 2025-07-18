import { pool } from '../config/database';
import { User } from '../types';
import { AppError } from '../middleware/errorHandler';

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, email, name, role, department, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, name, role, department, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(userData: {
    email: string;
    password: string;
    name: string;
    role: 'employee' | 'accounting';
    department?: string;
  }): Promise<User> {
    const { email, password, name, role, department } = userData;

    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, name, role, department) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, role, department, created_at, updated_at`,
        [email, password, name, role, department]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError(400, 'DUPLICATE_EMAIL', 'Email already exists');
      }
      throw error;
    }
  }

  static async update(
    id: string,
    userData: {
      name?: string;
      department?: string;
      role?: 'employee' | 'accounting';
    }
  ): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(userData.name);
      paramCount++;
    }

    if (userData.department !== undefined) {
      updates.push(`department = $${paramCount}`);
      values.push(userData.department);
      paramCount++;
    }

    if (userData.role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(userData.role);
      paramCount++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, department, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}