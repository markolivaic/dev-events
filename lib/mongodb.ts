import mongoose, { Connection } from 'mongoose';

/**
 * Type definition for cached mongoose connection
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global interface to extend NodeJS global type with mongoose connection cache
 * This prevents TypeScript errors when accessing global.mongoose
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * MongoDB connection URI from environment variables
 * Throws error if not provided (required for production)
 */
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Cached connection object to store mongoose connection and promise
 * Uses global object in development to persist across hot reloads
 * In production, this is just a module-level variable
 */
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose
 * Implements singleton pattern to prevent multiple connections
 * 
 * @returns {Promise<typeof mongoose>} Mongoose instance with established connection
 * @throws {Error} If connection fails
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (cached.conn) {
    return mongoose;
  }

  // Reuse existing promise if connection is in progress
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create new connection promise
    // MONGODB_URI is guaranteed to be string here due to check above
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for connection to establish
    cached.conn = (await cached.promise).connection;
  } catch (error) {
    // Clear promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return mongoose;
}

export default connectDB;

