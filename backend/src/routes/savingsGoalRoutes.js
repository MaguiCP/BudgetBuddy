import express from 'express';
import rateLimit from 'express-rate-limit';
import userMiddleware from '../middlewares/userMiddleware.js';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../controllers/savingsGoalController.js';

const router = express.Router();
const goalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(userMiddleware, goalLimiter);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
