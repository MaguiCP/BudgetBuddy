import express from 'express';
import { getAllTransactions, createTransaction, updateTransactionDetails, getTransaction, deleteTransaction } from '../controllers/transactionController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

router.get('/', userMiddleware, getAllTransactions);
router.post('/', userMiddleware, createTransaction);
router.put('/:id', userMiddleware, updateTransactionDetails);
router.get('/:id', getTransaction);
router.delete('/:id', deleteTransaction);

export default router;