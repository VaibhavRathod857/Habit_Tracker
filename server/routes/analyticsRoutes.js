import express from 'express';
import {
  getAnalyticsOverview,
  getHeatmapData,
  getCalendarDayDetails,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getAnalyticsOverview);
router.get('/heatmap', getHeatmapData);
router.get('/day/:date', getCalendarDayDetails);

export default router;
