import express from 'express';
import {
  getRecoveryStatus,
  activateRecoveryMode,
  completeRecoveryMode,
  toggleBadDayMode,
} from '../controllers/recoveryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/status', getRecoveryStatus);
router.post('/activate', activateRecoveryMode);
router.post('/complete', completeRecoveryMode);
router.post('/bad-day', toggleBadDayMode);

export default router;
