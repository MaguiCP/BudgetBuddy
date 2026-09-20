import {
  createRecurringTransaction,
  deleteRecurringTransactionById,
  generateRecurringTransactionById,
  getUserRecurringTransactions,
  updateRecurringTransactionById,
} from '../services/recurringTransactionService.js';

const createRecurring = async (req, res) => {
  try { return res.status(201).json({ recurringTransaction: await createRecurringTransaction(req.body, req.user.id) }); }
  catch (error) { return res.status(400).json({ error: error.message }); }
};
const getRecurring = (req, res) => res.status(200).json(getUserRecurringTransactions(req.user.id));
const updateRecurring = async (req, res) => {
  try { return res.status(200).json({ recurringTransaction: await updateRecurringTransactionById(req.params, req.body, req.user.id) }); }
  catch (error) { return res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message }); }
};
const deleteRecurring = async (req, res) => {
  try { await deleteRecurringTransactionById(req.params, req.user.id); return res.status(200).json({ message: 'Recurring transaction deleted successfully.' }); }
  catch (error) { return res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message }); }
};
const generateRecurring = async (req, res) => {
  try { return res.status(201).json({ recurringTransaction: await generateRecurringTransactionById(req.params, req.user.id) }); }
  catch (error) { return res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message }); }
};

export { createRecurring, getRecurring, updateRecurring, deleteRecurring, generateRecurring };
