import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, 'NOT_FOUND', message, 404);
  }

  static badRequest(res: Response, message: string, details?: any): Response {
    return this.error(res, 'BAD_REQUEST', message, 400, details);
  }

  static internalError(res: Response, message = 'Internal server error'): Response {
    return this.error(res, 'INTERNAL_ERROR', message, 500);
  }
}