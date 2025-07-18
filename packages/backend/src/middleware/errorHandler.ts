import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error caught by error handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    return ResponseUtil.error(res, err.code, err.message, err.statusCode, err.details);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, 'Validation error', err.message);
  }

  if (err.name === 'UnauthorizedError') {
    return ResponseUtil.unauthorized(res, 'Authentication required');
  }

  if (err.name === 'CastError') {
    return ResponseUtil.badRequest(res, 'Invalid ID format');
  }

  // Database errors
  if ((err as any).code === '23505') {
    return ResponseUtil.badRequest(res, 'Duplicate entry');
  }

  if ((err as any).code === '23503') {
    return ResponseUtil.badRequest(res, 'Referenced resource not found');
  }

  // Default error
  return ResponseUtil.internalError(res, 'An unexpected error occurred');
};

export const notFoundHandler = (_req: Request, res: Response) => {
  return ResponseUtil.notFound(res, 'Route not found');
};