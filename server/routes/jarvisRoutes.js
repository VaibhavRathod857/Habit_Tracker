import express from 'express';
import {
  handleChatMessage,
  handleStreamChatMessage,
  handleConfirmAction,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  getMemories,
  saveMemory,
  deleteMemory,
  clearAllMemories,
  getDashboardCard,
  getSettings,
  updateSettings,
} from '../controllers/jarvisController.js';
import { protect } from '../middleware/authMiddleware.js';
import { jarvisChatLimiter, jarvisActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All JARVIS routes require authentication
router.use(protect);

// Chat & Streaming
router.post('/chat', jarvisChatLimiter, handleChatMessage);
router.post('/chat/stream', jarvisChatLimiter, handleStreamChatMessage);

// Tool Action Execution & Confirmation
router.post('/actions/confirm', jarvisActionLimiter, handleConfirmAction);
router.post('/actions/execute', jarvisActionLimiter, handleConfirmAction);

// Proactive Dashboard Card
router.get('/dashboard-card', getDashboardCard);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Memory Management
router.get('/memories', getMemories);
router.post('/memories', saveMemory);
router.delete('/memories/:id', deleteMemory);
router.delete('/memories', clearAllMemories);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.put('/conversations/:id', updateConversation);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);

export default router;
