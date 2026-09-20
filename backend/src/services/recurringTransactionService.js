import RecurringTransaction from '../models/RecurringTransaction.js';
import {
  addRecurringTransaction,
  deleteRecurringTransaction,
  findRecurringTransactionById,
  getRecurringTransactions,
  updateRecurringTransaction,
} from '../repositories/recurringTransactionRepository.js';
import { addTransaction } from '../models/Transaction.js';
import { validateRecurringTransaction, validateRecurringTransactionId } from '../validation/recurringTransactionValidation.js';

const forUser = (id, userId) => {
  const item = findRecurringTransactionById(id);
  return item && item.userId === userId ? item : null;
};

export const createRecurringTransaction = async (data, userId) => {
  const validated = await validateRecurringTransaction(data);
  return addRecurringTransaction(new RecurringTransaction(
    validated.description,
    validated.amount,
    validated.type,
    validated.category,
    validated.frequency,
    validated.nextDate,
    userId,
  ));
};

export const getUserRecurringTransactions = (userId) => getRecurringTransactions().filter((item) => item.userId === userId);

export const updateRecurringTransactionById = async (idData, data, userId) => {
  const { id } = await validateRecurringTransactionId(idData);
  if (!forUser(id, userId)) throw new Error('Recurring transaction not found.');
  const validated = await validateRecurringTransaction(data);
  return updateRecurringTransaction(id, validated);
};

export const deleteRecurringTransactionById = async (idData, userId) => {
  const { id } = await validateRecurringTransactionId(idData);
  if (!forUser(id, userId) || !deleteRecurringTransaction(id)) throw new Error('Recurring transaction not found.');
};

export const generateRecurringTransactionById = async (idData, userId) => {
  const { id } = await validateRecurringTransactionId(idData);
  const recurring = forUser(id, userId);
  if (!recurring) throw new Error('Recurring transaction not found.');
  if (!recurring.active) throw new Error('Recurring transaction is inactive.');

  const amount = recurring.type === 'expense' ? -Math.abs(recurring.amount) : Math.abs(recurring.amount);
  const transaction = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    description: recurring.description,
    amount,
    type: recurring.type,
    category: recurring.category,
    date: recurring.nextDate,
    userId,
  };
  addTransaction(transaction);

  const nextDate = new Date(recurring.nextDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return updateRecurringTransaction(id, { ...recurring, nextDate: nextDate.toISOString() });
};
