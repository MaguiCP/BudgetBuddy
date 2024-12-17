import express from 'express';
import { getAllTransactions, createTransaction, updateTransactionDetails, getTransaction, deleteTransaction, getFilteredTransactions, getTransactionReport, getTransactionReportByPeriod } from '../controllers/transactionController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

router.get('/', userMiddleware, getAllTransactions);
router.post('/', userMiddleware, createTransaction);
router.get('/category', userMiddleware, getFilteredTransactions);
router.get('/report', userMiddleware, getTransactionReport);
router.get('/balance', userMiddleware, getTransactionReportByPeriod);
router.delete('/:id', userMiddleware, deleteTransaction);
router.put('/:id', userMiddleware, updateTransactionDetails);
router.get('/:id', userMiddleware, getTransaction);

export default router;