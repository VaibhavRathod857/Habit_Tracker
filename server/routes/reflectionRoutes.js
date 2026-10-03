import express from 'express';
import {
  getTodayReflection,
  saveReflection,
  getReflectionHistory,
} from '../controllers/reflectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/today', getTodayReflection);
router.post('/', saveReflection);
router.get('/history', getReflectionHistory);

export default router;
