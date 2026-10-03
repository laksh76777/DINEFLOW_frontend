import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';
import { staffRequestRoutes } from './routes/staffRequestRoutes.js';
import { paymentRoutes } from './routes/paymentRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly permissive CORS
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role', 'x-staff-id'],
    })
  );

  // Rate Limiter
  app.use('/api', apiRateLimiter);

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Structured HTTP Request Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      const meta = {
        method: req.method,
        url: req.originalUrl,
        status,
        duration: `${duration}ms`,
        ip: req.ip,
      };

      if (status >= 500) {
        logger.error(`HTTP ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`, meta);
      } else if (status >= 400) {
        logger.warn(`HTTP ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`, meta);
      } else {
        logger.info(`HTTP ${req.method} ${req.originalUrl} - ${status} (${duration}ms)`, meta);
      }
    });
    next();
  });

  // GET /api/health
  app.get('/api/health', (_req: Request, res: Response) => {
    const dbStateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

    res.status(200).json({
      status: 'ok',
      service: 'DineFlow Smart Restaurant API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/restaurant', restaurantRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/requests', staffRequestRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // 404 Handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found`,
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}
