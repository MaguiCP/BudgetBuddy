import Transaction, { addTransaction, getTransactions, updateTransaction, deleteTransactionById, findTransactionById } from '../models/Transaction.js';
import { validateTransaction, validateTransactionId } from '../validation/transactionValidation.js';

const normalizeTransactionsForUser = (transactions, userId) => {
  return transactions.filter((transaction) => transaction.userId === userId);
};

const getAllTransactions = (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'date', month, category, type } = req.query;
    let userTransactions = normalizeTransactionsForUser(getTransactions(), req.user.id);

    if (month) {
      userTransactions = userTransactions.filter((transaction) => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === month;
      });
    }

    if (category) {
      userTransactions = userTransactions.filter((transaction) =>
        transaction.category && transaction.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (type) {
      userTransactions = userTransactions.filter((transaction) => transaction.type === type);
    }

    const sortedTransactions = [...userTransactions].sort((a, b) => {
      if (sort === 'date') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sort === 'amount') {
        return a.amount - b.amount;
      }
      return 0;
    });

    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const startIndex = (Number(page) - 1) * safeLimit;
    const endIndex = startIndex + safeLimit;
    const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

    return res.status(200).json({
      page: Number(page),
      limit: safeLimit,
      totalTransactions: userTransactions.length,
      totalPages: Math.max(1, Math.ceil(userTransactions.length / safeLimit)),
      transactions: paginatedTransactions,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transactionData = await validateTransaction(req.body);
    const newTransaction = new Transaction(
      transactionData.description,
      transactionData.amount,
      transactionData.category,
      req.user.id,
      transactionData.date || new Date()
    );

    addTransaction(newTransaction);
    return res.status(201).json({ message: 'Transaction created successfully!', transaction: newTransaction });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateTransactionDetails = async (req, res) => {
  try {
    const { id } = await validateTransactionId(req.params);
    const existingTransaction = findTransactionById(id);

    if (!existingTransaction || existingTransaction.userId !== req.user.id) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const updatedTransaction = {
      ...existingTransaction,
      ...req.body,
      userId: req.user.id,
    };

    const transaction = updateTransaction(id, updatedTransaction);

    if (!transaction) {
      return res.status(500).json({ message: 'Error updating transaction.' });
    }

    return res.status(200).json({ message: 'Transaction updated successfully!', transaction });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getTransaction = (req, res) => {
  try {
    const { id } = req.params;
    const transaction = findTransactionById(id);

    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteTransaction = (req, res) => {
  try {
    const { id } = req.params;
    const transaction = findTransactionById(id);

    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const deleted = deleteTransactionById(id);

    if (!deleted) {
      return res.status(500).json({ message: 'Error deleting transaction.' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully!' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getFilteredTransactions = (req, res) => {
  try {
    const { type, category } = req.query;
    let filteredTransactions = normalizeTransactionsForUser(getTransactions(), req.user.id);

    if (type) {
      filteredTransactions = filteredTransactions.filter((transaction) => transaction.type === type);
    }

    if (category) {
      filteredTransactions = filteredTransactions.filter((transaction) =>
        transaction.category && transaction.category.toLowerCase() === category.toLowerCase()
      );
    }

    return res.status(200).json(filteredTransactions);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getTransactionSummary = (req, res) => {
  const { month, category } = req.query;
  let userTransactions = normalizeTransactionsForUser(getTransactions(), req.user.id);

  if (month) {
    userTransactions = userTransactions.filter((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === month;
    });
  }

  if (category) {
    userTransactions = userTransactions.filter((transaction) =>
      transaction.category && transaction.category.toLowerCase() === category.toLowerCase()
    );
  }

  const totalIncome = userTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = Math.abs(userTransactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0));

  const recentTransactions = [...userTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
    }));

  const byCategory = Object.entries(
    userTransactions.reduce((acc, transaction) => {
      const key = transaction.category || 'Other';
      acc[key] = (acc[key] || 0) + Number(transaction.amount);
      return acc;
    }, {})
  ).map(([categoryName, total]) => ({
    category: categoryName,
    total: Number(total),
  }));

  return res.status(200).json({
    month: month || null,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    byCategory,
    recentTransactions,
  });
};

const getTransactionsByCategory = (req, res) => {
  const userTransactions = normalizeTransactionsForUser(getTransactions(), req.user.id);

  const result = userTransactions.reduce((acc, transaction) => {
    const key = transaction.category || 'Other';
    if (!acc[key]) {
      acc[key] = 0;
    }

    acc[key] += Number(transaction.amount);
    return acc;
  }, {});

  return res.status(200).json(
    Object.entries(result).map(([category, total]) => ({ category, total }))
  );
};

const getTransactionReport = (req, res) => {
  const { interval = 'monthly' } = req.query;
  const userTransactions = normalizeTransactionsForUser(getTransactions(), req.user.id);

  const formatDate = (date, interval) => {
    const d = new Date(date);
    if (interval === 'daily') {
      return d.toISOString().split('T')[0];
    }
    if (interval === 'weekly') {
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((d - startOfYear) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-W${weekNumber}`;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const balancePerPeriod = userTransactions.reduce((acc, transaction) => {
    const period = formatDate(transaction.date, interval);

    if (!acc[period]) {
      acc[period] = { incomeTotal: 0, expenseTotal: 0, balance: 0 };
    }

    if (transaction.amount > 0) {
      acc[period].incomeTotal += Number(transaction.amount);
    } else {
      acc[period].expenseTotal += Math.abs(Number(transaction.amount));
    }

    acc[period].balance = acc[period].incomeTotal - acc[period].expenseTotal;
    return acc;
  }, {});

  const result = Object.keys(balancePerPeriod).map((period) => ({
    period,
    ...balancePerPeriod[period],
  }));

  return res.status(200).json(result);
};

export {
  getAllTransactions,
  createTransaction,
  updateTransactionDetails,
  getTransaction,
  deleteTransaction,
  getFilteredTransactions,
  getTransactionSummary,
  getTransactionsByCategory,
  getTransactionReport,
};