import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocketServer } from './sockets/socketServer.js';
import { initRedis } from './config/redis.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    logger.info('Starting DineFlow Backend Services...');

    // 1. Initialize Redis / Cache
    await initRedis();

    // 2. Create Express App & HTTP Server
    const app = createApp();
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO Foundation
    initSocketServer(httpServer);

    // 4. Start Listening immediately so health checks and API are available
    httpServer.listen(PORT, () => {
      logger.info(`✨ DineFlow Server listening on http://localhost:${PORT}`);
      logger.info(`⚡ Health Check available at http://localhost:${PORT}/api/health`);
    });

    // 5. Connect to Database (Atlas, Local, or MongoMemoryServer) in background
    connectDatabase()
      .then(async () => {
        const { seedInitialUsers } = await import('./scripts/seed.js');
        await seedInitialUsers();
      })
      .catch((err) => {
        logger.warn(`Initial database connection attempt failed: ${err.message}`);
      });

    // Graceful Shutdown Handling
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down DineFlow gracefully...`);
      httpServer.close(async () => {
        await disconnectDatabase();
        logger.info('DineFlow Server stopped cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err: any) {
    logger.error(`Critical server initialization error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

bootstrap();
