import express from 'express';
import {
  generateWeeklyReview,
  saveWeeklyReview,
  getWeeklyReviews,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/generate', generateWeeklyReview);
router.post('/', saveWeeklyReview);
router.get('/history', getWeeklyReviews);

export default router;
