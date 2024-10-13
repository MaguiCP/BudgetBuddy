import express from 'express';
import { listTransactions, createTransaction } from '../controllers/transactionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, listTransactions); 
router.post('/', authMiddleware, createTransaction); 

export default router;
