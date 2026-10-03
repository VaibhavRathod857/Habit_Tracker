import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      autoIndex: true,
    });
    console.log(`[DisciplineOS DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DisciplineOS DB] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
