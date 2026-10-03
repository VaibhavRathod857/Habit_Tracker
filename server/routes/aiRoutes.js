import express from 'express';
import { getAICoachInsights } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/insights', getAICoachInsights);

export default router;
