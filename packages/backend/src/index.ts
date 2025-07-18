import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import { ResponseUtil } from './utils/response';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { csrfTokenEndpoint, csrfProtection } from './middleware/csrf';
import { xssProtection, setCspHeaders, validateInput } from './middleware/xssProtection';
import routes from './routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(setCspHeaders);
app.use(validateInput);
app.use(xssProtection);

// Rate limiting middleware
app.use(generalLimiter);

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Basic route
app.get('/api/health', (_req, res) => {
  return ResponseUtil.success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.node_env,
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenEndpoint);

// API routes with CSRF protection
app.use('/api', csrfProtection, routes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      logger.info(`🚀 Backend server running on port ${config.port}`);
      logger.info(`📍 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();