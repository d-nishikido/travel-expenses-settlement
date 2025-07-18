import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Create a new JSDOM instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

interface SanitizedRequest extends Request {
  sanitized?: boolean;
}

// XSS protection middleware
export const xssProtection = (req: SanitizedRequest, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
    req.sanitized = true;
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Sanitize object recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// Sanitize string content
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove any script tags and dangerous content
  let sanitized = purify.sanitize(str, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
  });
  
  // Additional custom sanitization rules
  sanitized = sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove any remaining script tags
    .replace(/style\s*=\s*["'][^"']*["']/gi, '') // Remove inline styles
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove URL() in CSS
    .replace(/import\s*\(/gi, ''); // Remove import statements
  
  return sanitized;
}

// Content Security Policy headers
export const setCspHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Input validation for dangerous patterns
export const validateInput = (req: Request, res: Response, next: NextFunction): void => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*javascript:/gi,
    /url\s*\(\s*data:/gi,
    /import\s*\(/gi,
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /Function\s*\(/gi,
    /document\.write/gi,
    /innerHTML/gi,
    /outerHTML/gi,
    /document\.cookie/gi,
    /window\.location/gi,
    /document\.location/gi
  ];
  
  const checkForDangerousPatterns = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(obj));
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkForDangerousPatterns(item));
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkForDangerousPatterns(value));
    }
    
    return false;
  };
  
  if (checkForDangerousPatterns(req.body) || 
      checkForDangerousPatterns(req.query) || 
      checkForDangerousPatterns(req.params)) {
    res.status(400).json({
      error: 'Invalid input detected',
      message: 'Request contains potentially dangerous content'
    });
    return;
  }
  
  next();
};

// HTML escape utility
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};