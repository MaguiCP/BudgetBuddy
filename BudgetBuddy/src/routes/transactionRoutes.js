import express from 'express';
import { listTransactions, createTransaction } from '../controllers/transactionController.js';
import userMiddleware from '../middlewares/userMiddleware.js';

const router = express.Router();

router.get('/', userMiddleware, listTransactions); 
router.post('/', userMiddleware, createTransaction); 

export default router;
