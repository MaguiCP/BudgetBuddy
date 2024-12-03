import Transaction, { addTransaction, getTransactions, updateTransaction } from '../models/Transaction.js';
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
    return res.status(400).json({ message: error.details[0].message });
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

export const getFilteredTransactions = (req, res) => {
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

export const getTransactionReport = (req, res) => {
  const transactions = getTransactions();

  // Calcular receitas, despesas e saldo
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