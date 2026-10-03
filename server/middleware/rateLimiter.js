import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Limit each IP to 50 auth requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login/registration attempts, please try again in a few minutes',
  },
});

export const jarvisChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'JARVIS coaching rate limit reached. Please wait 30 seconds before sending another message.',
  },
});

export const jarvisActionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // 60 action executions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Action execution rate limit reached. Please wait a moment.',
  },
});

