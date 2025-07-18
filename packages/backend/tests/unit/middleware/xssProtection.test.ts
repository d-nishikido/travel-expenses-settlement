import { Request, Response } from 'express';
import { xssProtection, validateInput, escapeHtml } from '../../../src/middleware/xssProtection';

describe('XSS Protection Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('xssProtection', () => {
    it('should sanitize malicious script tags in request body', () => {
      // Arrange
      mockRequest.body = {
        title: 'Test Trip',
        description: '<script>alert("XSS")</script>Legitimate content',
      };

      // Act
      xssProtection(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.body.title).toBe('Test Trip');
      expect(mockRequest.body.description).not.toContain('<script>');
      expect(mockRequest.body.description).toContain('Legitimate content');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize malicious content in nested objects', () => {
      // Arrange
      mockRequest.body = {
        report: {
          title: 'Test Trip',
          items: [
            {
              description: '<img src=x onerror=alert("XSS")>',
              amount: 1000,
            },
          ],
        },
      };

      // Act
      xssProtection(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.body.report.items[0].description).not.toContain('onerror');
      expect(mockRequest.body.report.items[0].amount).toBe(1000);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      // Arrange
      mockRequest.query = {
        search: '<script>alert("XSS")</script>',
        page: '1',
      };

      // Act
      xssProtection(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.query.search).not.toContain('<script>');
      expect(mockRequest.query.page).toBe('1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle arrays in request body', () => {
      // Arrange
      mockRequest.body = {
        tags: ['<script>evil</script>', 'legitimate tag'],
      };

      // Act
      xssProtection(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.body.tags[0]).not.toContain('<script>');
      expect(mockRequest.body.tags[1]).toBe('legitimate tag');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not modify non-string values', () => {
      // Arrange
      mockRequest.body = {
        amount: 1000,
        date: new Date(),
        isActive: true,
        items: null,
      };

      // Act
      xssProtection(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.body.amount).toBe(1000);
      expect(mockRequest.body.isActive).toBe(true);
      expect(mockRequest.body.items).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateInput', () => {
    it('should block requests with dangerous script tags', () => {
      // Arrange
      mockRequest.body = {
        description: '<script>alert("XSS")</script>',
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid input detected',
        message: 'Request contains potentially dangerous content',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should block requests with javascript: protocol', () => {
      // Arrange
      mockRequest.body = {
        url: 'javascript:alert("XSS")',
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should block requests with event handlers', () => {
      // Arrange
      mockRequest.body = {
        content: '<div onclick="alert(1)">Click me</div>',
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow safe content to pass through', () => {
      // Arrange
      mockRequest.body = {
        title: 'Business Trip to Tokyo',
        description: 'Meeting with client to discuss the project',
        amount: 50000,
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should check query parameters for dangerous patterns', () => {
      // Arrange
      mockRequest.query = {
        search: 'document.write("evil")',
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should check URL parameters for dangerous patterns', () => {
      // Arrange
      mockRequest.params = {
        id: 'eval(malicious_code)',
      };

      // Act
      validateInput(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      // Arrange
      const unsafeHtml = '<script>alert("XSS")</script>';

      // Act
      const result = escapeHtml(unsafeHtml);

      // Assert
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should escape ampersands', () => {
      // Arrange
      const unsafeHtml = 'Johnson & Johnson';

      // Act
      const result = escapeHtml(unsafeHtml);

      // Assert
      expect(result).toBe('Johnson &amp; Johnson');
    });

    it('should escape quotes', () => {
      // Arrange
      const unsafeHtml = 'He said "Hello" and she said \'Hi\'';

      // Act
      const result = escapeHtml(unsafeHtml);

      // Assert
      expect(result).toBe('He said &quot;Hello&quot; and she said &#039;Hi&#039;');
    });

    it('should handle empty strings', () => {
      // Arrange
      const unsafeHtml = '';

      // Act
      const result = escapeHtml(unsafeHtml);

      // Assert
      expect(result).toBe('');
    });

    it('should handle strings with no special characters', () => {
      // Arrange
      const unsafeHtml = 'Regular text with no special characters';

      // Act
      const result = escapeHtml(unsafeHtml);

      // Assert
      expect(result).toBe('Regular text with no special characters');
    });
  });
});