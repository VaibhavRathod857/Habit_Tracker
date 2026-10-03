import express from 'express';
import { evaluateAchievements } from '../services/achievementService.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendSuccess } from '../utils/responseHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const achievements = await evaluateAchievements(req.user._id);
    return sendSuccess(res, achievements);
  } catch (err) {
    next(err);
  }
});

export default router;
