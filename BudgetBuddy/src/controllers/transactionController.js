import Transaction, { addTransaction, getTransactions } from '../models/Transaction.js';
import { validateTransaction, validateTransactionId } from '../validation/transactionValidation.js';

const getAllTransactions = (req, res) => {
  return res.status(200).json(getTransactions());
};

const createTransaction = async (req, res) => {
  try {
    const transactionData = await validateTransaction(req.body);
    const newTransaction = new Transaction(transactionData.description, transactionData.amount);
    addTransaction(newTransaction);
    return res.status(201).json({ message: 'Transaction created successfully!', transaction: newTransaction });
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

export { getAllTransactions, createTransaction };