import express from 'express';
import { getAllTransactions, createTransaction, updateTransactionDetails, getTransaction, deleteTransaction, getFilteredTransactions, getTransactionReport, getTransactionSummary, getTransactionsByCategory } from '../controllers/transactionController.js';
import userMiddleware from '../middlewares/userMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const transactionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.get('/', userMiddleware, transactionsLimiter, getAllTransactions);
router.post('/', userMiddleware, transactionsLimiter, createTransaction);
router.get('/category', userMiddleware, transactionsLimiter, getFilteredTransactions);
router.get('/summary', userMiddleware, transactionsLimiter, getTransactionSummary);
router.get('/by-category', userMiddleware, transactionsLimiter, getTransactionsByCategory);
router.get('/report', userMiddleware, transactionsLimiter, getTransactionReport);
router.delete('/:id', userMiddleware, transactionsLimiter, deleteTransaction);
router.put('/:id', userMiddleware, transactionsLimiter, updateTransactionDetails);
router.get('/:id', userMiddleware, transactionsLimiter, getTransaction);

export default router;