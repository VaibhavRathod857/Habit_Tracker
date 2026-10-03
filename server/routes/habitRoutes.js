import express from 'express';
import {
  getHabits,
  createHabit,
  getHabitById,
  updateHabit,
  deleteHabit,
  togglePauseHabit,
  reorderHabits,
  logHabit,
  getHabitHistory,
  acceptAdaptation,
  dismissAdaptation,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { habitSchema, habitLogSchema } from '../validators/habitValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', validateRequest(habitSchema), createHabit);
router.post('/reorder', reorderHabits);

router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/pause', togglePauseHabit);

router.post('/:id/log', validateRequest(habitLogSchema), logHabit);
router.get('/:id/history', getHabitHistory);
router.post('/:id/adaptation/accept', acceptAdaptation);
router.post('/:id/adaptation/dismiss', dismissAdaptation);

export default router;
