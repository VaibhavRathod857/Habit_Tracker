import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  reorderTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { taskSchema } from '../validators/taskValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validateRequest(taskSchema), createTask);
router.post('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskComplete);

export default router;
