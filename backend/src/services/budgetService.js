import Budget from '../models/Budget.js';
import {
  addBudget,
  deleteBudget,
  findBudgetById,
  getBudgets,
  updateBudget,
} from '../repositories/budgetRepository.js';
import { validateBudget, validateBudgetId } from '../validation/budgetValidation.js';

const findForUser = (id, userId) => {
  const budget = findBudgetById(id);
  return budget && budget.userId === userId ? budget : null;
};

export const createBudget = async (data, userId) => {
  const validated = await validateBudget(data);
  const duplicate = getBudgets().find(
    (budget) => budget.userId === userId && budget.month === validated.month && budget.category.toLowerCase() === validated.category.toLowerCase()
  );

  if (duplicate) {
    throw new Error('A budget already exists for this category and month.');
  }

  return addBudget(new Budget(validated.month, validated.category, validated.amount, userId));
};

export const getUserBudgets = (userId, month) => {
  return getBudgets().filter((budget) => budget.userId === userId && (!month || budget.month === month));
};

export const updateBudgetById = async (idData, data, userId) => {
  const { id } = await validateBudgetId(idData);
  const existing = findForUser(id, userId);

  if (!existing) {
    throw new Error('Budget not found.');
  }

  const validated = await validateBudget(data);
  const duplicate = getBudgets().find(
    (budget) => budget.id !== id && budget.userId === userId && budget.month === validated.month && budget.category.toLowerCase() === validated.category.toLowerCase()
  );

  if (duplicate) {
    throw new Error('A budget already exists for this category and month.');
  }

  return updateBudget(id, { ...existing, ...validated });
};

export const deleteBudgetById = async (idData, userId) => {
  const { id } = await validateBudgetId(idData);

  if (!findForUser(id, userId) || !deleteBudget(id)) {
    throw new Error('Budget not found.');
  }
};
