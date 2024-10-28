import express from 'express';
import { getAllTransactions, createTransaction } from '../controllers/transactionController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

router.get('/', userMiddleware, getAllTransactions);
router.post('/', userMiddleware, createTransaction);

export default router;