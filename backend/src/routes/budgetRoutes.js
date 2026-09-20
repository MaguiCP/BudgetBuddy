import express from 'express';
import rateLimit from 'express-rate-limit';
import userMiddleware from '../middlewares/userMiddleware.js';
import {
  createBudgetController,
  getBudgetsController,
  updateBudgetController,
  deleteBudgetController,
} from '../controllers/budgetController.js';

const router = express.Router();
const budgetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(userMiddleware, budgetLimiter);
router.get('/', getBudgetsController);
router.post('/', createBudgetController);
router.put('/:id', updateBudgetController);
router.delete('/:id', deleteBudgetController);

export default router;
