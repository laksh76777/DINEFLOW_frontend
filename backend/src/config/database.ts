import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let mongod: any = null;

export async function connectDatabase(): Promise<string> {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      logger.info(`Connecting to configured MongoDB instance...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      logger.info('Connected to MongoDB successfully');
      return uri;
    } catch (err: any) {
      logger.warn(`Failed to connect to configured MONGODB_URI: ${err.message}. Falling back to in-memory MongoDB.`);
    }
  }

  // Fallback to MongoMemoryServer for effortless zero-config local run
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    logger.info('Starting MongoMemoryServer for development...');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    logger.info(`Connected to MongoMemoryServer at ${memoryUri}`);
    return memoryUri;
  } catch (memErr: any) {
    logger.error('Failed to initialize in-memory MongoDB:', memErr.message);
    throw memErr;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
  logger.info('Disconnected from MongoDB');
}
