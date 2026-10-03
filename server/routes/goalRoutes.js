import express from 'express';
import {
  getGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  toggleMilestone,
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { goalSchema } from '../validators/goalValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', validateRequest(goalSchema), createGoal);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/milestones/:milestoneId', toggleMilestone);

export default router;
