import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CSRFRequest extends Request {
  csrfToken?: string;
  session?: any;
}

// Simple in-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number; used: boolean }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const generateCSRFToken = (req: CSRFRequest): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous';
  const expires = Date.now() + (60 * 60 * 1000); // 1 hour expiry
  
  csrfTokens.set(sessionId, {
    token,
    expires,
    used: false
  });
  
  return token;
};

export const csrfProtection = (req: CSRFRequest, res: Response, next: NextFunction) => {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF protection for health checks
  if (req.path === '/api/health') {
    return next();
  }

  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous';
  const clientToken = req.headers['x-csrf-token'] as string || req.body._csrf;

  if (!clientToken) {
    return res.status(403).json({
      error: 'CSRF token required',
      message: 'Missing CSRF token in request'
    });
  }

  const storedTokenData = csrfTokens.get(sessionId);
  
  if (!storedTokenData) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'No CSRF token found for this session'
    });
  }

  if (storedTokenData.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({
      error: 'CSRF token expired',
      message: 'CSRF token has expired'
    });
  }

  if (storedTokenData.used) {
    return res.status(403).json({
      error: 'CSRF token already used',
      message: 'CSRF token can only be used once'
    });
  }

  if (storedTokenData.token !== clientToken) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token does not match'
    });
  }

  // Mark token as used (one-time use)
  storedTokenData.used = true;
  
  next();
};

export const csrfTokenEndpoint = (req: CSRFRequest, res: Response) => {
  const token = generateCSRFToken(req);
  res.json({
    csrfToken: token,
    expiresIn: 60 * 60 * 1000 // 1 hour
  });
};

// Double submit cookie pattern for additional security
export const doubleSubmitCookie = (req: CSRFRequest, res: Response, next: NextFunction) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'] as string;

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      error: 'CSRF protection failed',
      message: 'Missing CSRF token in cookie or header'
    });
  }

  if (cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'CSRF protection failed',
      message: 'CSRF tokens do not match'
    });
  }

  next();
};