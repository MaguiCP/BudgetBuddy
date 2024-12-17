import Transaction, { addTransaction, getTransactions, updateTransaction } from '../models/Transaction.js';
import { validateTransaction, validateTransactionId } from '../validation/transactionValidation.js';

const getAllTransactions = (req, res) => {
  const { page = 1, limit = 10, sort = 'date' } = req.query;
  const transactions = getTransactions();

  const sortedTransactions = transactions.sort((a, b) => {
    if (sort === 'date') {
      return new Date(a.date) - new Date(b.date);
    } else if (sort === 'amount') {
      return a.amount - b.amount;
    }
    return 0;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  return res.status(200).json({
    page,
    limit,
    totalTransactions: transactions.length,
    totalPages: Math.ceil(transactions.length / limit),
    transactions: paginatedTransactions
  });
};

const createTransaction = async (req, res) => {
  try {
    const transactionData = await validateTransaction(req.body);
    const newTransaction = new Transaction(transactionData.description, transactionData.amount, transactionData.category);
    addTransaction(newTransaction);
    return res.status(201).json({ message: 'Transaction created successfully!', transaction: newTransaction });
  } catch (error) {
    console.log('Error:', error);
    return res.status(400).json({ message: 'An unexpected error occurred.' });
  }
};

const updateTransactionDetails = async (req, res) => {
  try {
    const { id } = await validateTransactionId(req.params);
    const existingTransaction = getTransactions().find(u => u.id == id);

    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const updatedTransaction = {
      ...existingTransaction,
      ...req.body
    };

    const transaction = updateTransaction(id, updatedTransaction);

    if (!transaction) {
      return res.status(500).json({ message: 'Error updating transaction.' });
    }

    return res.status(200).json({ message: 'Transaction updated successfully!', transaction });
  } catch (error) {
    console.log('Error:', error);
    return res.status(400).json({ message: 'An unexpected error occurred.' });
  }
};

const getTransaction = (req, res) => {
  const { id } = req.params;
  const transactions = getTransactions();
  const transactionIndex = transactions.findIndex(transaction => transaction.id === Number(id));

  if (transactionIndex === -1) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  return res.status(200).json({ transactions });
};

const deleteTransaction = (req, res) => {
  const { id } = req.params;
  const transactions = getTransactions();
  const transactionIndex = transactions.findIndex(transaction => transaction.id === Number(id));

  if (transactionIndex === -1) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  transactions.splice(transactionIndex, 1);
  return res.status(200).json({ message: 'Transaction deleted successfully!' });
};

const getFilteredTransactions = (req, res) => {
  const { type, category } = req.query;
  let filteredTransactions = getTransactions();

  if (type) {
    filteredTransactions = filteredTransactions.filter(transaction =>
      type === 'income' ? transaction.amount > 0 : transaction.amount < 0
    );
  }

  if (category) {
    filteredTransactions = filteredTransactions.filter(transaction =>
      transaction.category && transaction.category.toLowerCase() === category.toLowerCase()
    );
  }

  return res.status(200).json(filteredTransactions);
};

const getTransactionReport = (req, res) => {
  const transactions = getTransactions();

  const incomeTotal = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenseTotal = transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = incomeTotal + expenseTotal;

  return res.status(200).json({
    incomeTotal,
    expenseTotal,
    balance
  });
};

export { getAllTransactions, createTransaction, updateTransactionDetails, getTransaction, deleteTransaction, getFilteredTransactions, getTransactionReport };