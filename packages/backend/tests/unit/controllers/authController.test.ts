import { Request, Response } from 'express';
import { AuthController } from '../../../src/controllers/authController';
import { AuthService } from '../../../src/services/authService';
import { AuthRequest } from '../../../src/middleware/auth';
import { testUsers } from '../../fixtures/users';

// Mock dependencies
jest.mock('../../../src/services/authService', () => ({
  AuthService: {
    login: jest.fn(),
    getUserById: jest.fn(),
  },
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthController', () => {
  let mockRequest: Partial<Request & AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call AuthService.login with correct parameters', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
        password: 'password123',
      };

      mockRequest.body = loginData;

      const mockResult = {
        token: 'test-jwt-token',
        user: testUsers.employee,
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      // Act
      await AuthController.login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when AuthService.login throws', async () => {
      // Arrange
      const loginData = {
        email: testUsers.employee.email,
        password: 'password123',
      };

      mockRequest.body = loginData;

      const mockError = new Error('Authentication failed');
      mockAuthService.login.mockRejectedValue(mockError);

      // Act
      await AuthController.login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      // Act
      await AuthController.logout(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
        data: null,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      // Arrange
      const mockUser = testUsers.employee;
      mockRequest.user = { userId: mockUser.id, email: mockUser.email, role: mockUser.role };
      
      mockAuthService.getUserById.mockResolvedValue(mockUser);

      // Act
      await AuthController.getCurrentUser(mockRequest as any, mockResponse as Response, mockNext);

      // Assert
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return unauthorized when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await AuthController.getCurrentUser(mockRequest as any, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockAuthService.getUserById).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when AuthService.getUserById throws', async () => {
      // Arrange
      const mockUser = testUsers.employee;
      mockRequest.user = { userId: mockUser.id, email: mockUser.email, role: mockUser.role };
      
      const mockError = new Error('Database error');
      mockAuthService.getUserById.mockRejectedValue(mockError);

      // Act
      await AuthController.getCurrentUser(mockRequest as any, mockResponse as Response, mockNext);

      // Assert
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});