import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/disciplineos',
  JWT_SECRET: process.env.JWT_SECRET || 'discipline_os_jwt_super_secret_key_2026_xyz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'discipline_os_refresh_secret_key_2026_abc',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_PROVIDER: process.env.AI_PROVIDER || '', // 'openai' | 'gemini' | 'anthropic' | 'local'
  AI_MODEL: process.env.AI_MODEL || '',
  AI_API_KEY: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
  AI_API_URL: process.env.AI_API_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || process.env.AI_API_URL || 'https://api.openai.com/v1',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY || '',
};

