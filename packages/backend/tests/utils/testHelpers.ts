import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/env';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'accounting';
  token?: string;
}

export interface TestExpenseReport {
  id: string;
  user_id: string;
  title: string;
  trip_purpose: string;
  trip_start_date: string;
  trip_end_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  total_amount: number;
}

export interface TestExpenseItem {
  id: string;
  expense_report_id: string;
  category: 'transportation' | 'accommodation' | 'meal' | 'other';
  description: string;
  amount: number;
  expense_date: string;
}

// Generate JWT token for testing
export const generateTestToken = (user: Partial<TestUser>): string => {
  return jwt.sign(
    {
      id: user.id || 'test-user-id',
      email: user.email || 'test@example.com',
      role: user.role || 'employee'
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
};

// Test helper for authenticated requests
export const authenticatedRequest = (app: Express, user: TestUser) => {
  const token = user.token || generateTestToken(user);
  return request(app).set('Authorization', `Bearer ${token}`);
};

// Test helper for CSRF protected requests
export const csrfProtectedRequest = async (app: Express, user?: TestUser) => {
  // First get CSRF token
  const csrfResponse = await request(app).get('/api/csrf-token');
  const csrfToken = csrfResponse.body.csrfToken;
  
  const req = user ? authenticatedRequest(app, user) : request(app);
  return req.set('X-CSRF-Token', csrfToken).set('X-Session-Id', 'test-session');
};

// Helper to create test database cleanup
export const cleanupTestData = async () => {
  // This would connect to test database and clean up
  // For now, we'll just return a promise
  return Promise.resolve();
};

// Helper to wait for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to generate unique test data
export const generateUniqueId = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to validate response structure
export const validateErrorResponse = (response: any) => {
  expect(response.body).toHaveProperty('error');
  expect(typeof response.body.error).toBe('string');
};

export const validateSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.body).toHaveProperty('success', true);
  if (expectedData) {
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toMatchObject(expectedData);
  }
};

// Helper to mock database operations
export const mockDatabase = {
  user: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expenseReport: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expenseItem: {
    findById: jest.fn(),
    findByReportId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Helper to reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  Object.values(mockDatabase).forEach(model => {
    Object.values(model).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
};

// Helper to create test environment
export const createTestEnv = () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    };
  });
  
  afterEach(() => {
    process.env = originalEnv;
    resetMocks();
  });
  
  afterAll(async () => {
    await cleanupTestData();
  });
};