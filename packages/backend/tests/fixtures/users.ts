import { TestUser } from '../utils/testHelpers';

export const testUsers: Record<string, TestUser> = {
  employee: {
    id: 'test-employee-id',
    email: 'employee@test.com',
    name: 'Test Employee',
    role: 'employee',
  },
  accounting: {
    id: 'test-accounting-id',
    email: 'accounting@test.com',
    name: 'Test Accounting',
    role: 'accounting',
  },
  anotherEmployee: {
    id: 'test-employee-2-id',
    email: 'employee2@test.com',
    name: 'Another Employee',
    role: 'employee',
  },
};

export const invalidUsers = {
  missingEmail: {
    id: 'test-id',
    name: 'Test User',
    role: 'employee',
  },
  invalidRole: {
    id: 'test-id',
    email: 'test@test.com',
    name: 'Test User',
    role: 'invalid-role',
  },
  emptyName: {
    id: 'test-id',
    email: 'test@test.com',
    name: '',
    role: 'employee',
  },
};

export const userPasswords = {
  employee: 'password123',
  accounting: 'password456',
  anotherEmployee: 'password789',
};

export const hashedPasswords = {
  employee: '$2b$10$zHxJvCaJQKYqJk8pXF8.bOdJKvLy3kGF5RJvYRwL7qvgWKf7q8YQa', // hashed 'password123'
  accounting: '$2b$10$7HxJvCaJQKYqJk8pXF8.bOdJKvLy3kGF5RJvYRwL7qvgWKf7q8YQb', // hashed 'password456'
  anotherEmployee: '$2b$10$8HxJvCaJQKYqJk8pXF8.bOdJKvLy3kGF5RJvYRwL7qvgWKf7q8YQc', // hashed 'password789'
};