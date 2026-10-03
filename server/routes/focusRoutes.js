import express from 'express';
import {
  logFocusSession,
  getFocusHistory,
  getFocusStats,
} from '../controllers/focusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/complete', logFocusSession);
router.get('/history', getFocusHistory);
router.get('/stats', getFocusStats);

export default router;
