import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Route imports
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import focusRoutes from './routes/focusRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import rulesRoutes from './routes/rulesRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import jarvisRoutes from './routes/jarvisRoutes.js';

const app = express();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

if (ENV.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting on general API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DisciplineOS Core API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/rules-and-stacks', rulesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/jarvis', jarvisRoutes);

// In production, serve frontend client build
if (ENV.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 Handler for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  const server = app.listen(ENV.PORT, () => {
    console.log(`[DisciplineOS API] Running in ${ENV.NODE_ENV} mode on http://localhost:${ENV.PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
    // Keep running in dev, or close gracefully in prod
  });

  return server;
};

// Export app for integration tests
export { app, startServer };

if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
  startServer();
}

