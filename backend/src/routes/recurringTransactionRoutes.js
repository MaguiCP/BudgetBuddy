import express from 'express';
import rateLimit from 'express-rate-limit';
import userMiddleware from '../middlewares/userMiddleware.js';
import { createRecurring, getRecurring, updateRecurring, deleteRecurring, generateRecurring } from '../controllers/recurringTransactionController.js';

const router = express.Router();
const recurringLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(userMiddleware, recurringLimiter);
router.get('/', getRecurring);
router.post('/', createRecurring);
router.put('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);
router.post('/:id/generate', generateRecurring);
export default router;
