import express from 'express';
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getStacks,
  createStack,
  updateStack,
  deleteStack,
} from '../controllers/rulesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

router.get('/stacks', getStacks);
router.post('/stacks', createStack);
router.put('/stacks/:id', updateStack);
router.delete('/stacks/:id', deleteStack);

export default router;
