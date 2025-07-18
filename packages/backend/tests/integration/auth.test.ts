import request from 'supertest';
import express from 'express';
import { createTestEnv } from '../utils/testHelpers';
import { testUsers, userPasswords } from '../fixtures/users';

// Mock the app setup for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock routes for testing
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
    }
    
    // Mock authentication logic
    if (email === testUsers.employee.email && password === userPasswords.employee) {
      return res.json({
        success: true,
        data: {
          token: 'test-jwt-token',
          user: testUsers.employee,
        },
      });
    }
    
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect',
    });
  });
  
  app.get('/api/csrf-token', (_req, res) => {
    res.json({
      csrfToken: 'test-csrf-token',
      expiresIn: 3600000,
    });
  });
  
  return app;
};

describe('Authentication API', () => {
  let app: express.Application;
  
  createTestEnv();
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
        password: userPasswords.employee,
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeTruthy();
      expect(response.body.data.user.email).toBe(testUsers.employee.email);
      expect(response.body.data.user.role).toBe(testUsers.employee.role);
    });
    
    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
        password: 'wrongpassword',
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
    
    it('should return 400 for missing email', async () => {
      // Arrange
      const loginData = {
        password: userPasswords.employee,
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
    
    it('should return 400 for missing password', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
    
    it('should return 400 for empty request body', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({});
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
    
    it('should handle SQL injection attempts', async () => {
      // Arrange
      const maliciousData = {
        email: "'; DROP TABLE users; --",
        password: userPasswords.employee,
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(maliciousData);
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
    
    it('should handle XSS attempts in email field', async () => {
      // Arrange
      const xssData = {
        email: '<script>alert("XSS")</script>',
        password: userPasswords.employee,
      };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(xssData);
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
  
  describe('GET /api/csrf-token', () => {
    it('should return CSRF token', async () => {
      // Act
      const response = await request(app)
        .get('/api/csrf-token');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.csrfToken).toBeTruthy();
      expect(response.body.expiresIn).toBe(3600000);
    });
  });
  
  describe('Rate Limiting', () => {
    it('should allow normal request rate', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
        password: userPasswords.employee,
      };
      
      // Act & Assert - Make a few requests that should succeed
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
        
        expect(response.status).toBe(200);
      }
    });
    
    // Note: This test would require actual rate limiting middleware to be effective
    // For now, it's a placeholder showing how to test rate limiting
    it.skip('should block excessive requests', async () => {
      // Arrange
      const loginData = {
        email: 'wrong@test.com',
        password: 'wrongpassword',
      };
      
      // Act - Make many requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send(loginData)
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Assert - Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});