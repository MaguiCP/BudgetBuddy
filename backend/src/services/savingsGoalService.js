import SavingsGoal from '../models/SavingsGoal.js';
import {
  addSavingsGoal,
  deleteSavingsGoal,
  findSavingsGoalById,
  getSavingsGoals,
  updateSavingsGoal,
} from '../repositories/savingsGoalRepository.js';
import { validateSavingsGoal, validateSavingsGoalId } from '../validation/savingsGoalValidation.js';

const findForUser = (id, userId) => {
  const goal = findSavingsGoalById(id);
  return goal && goal.userId === userId ? goal : null;
};

export const createSavingsGoal = async (data, userId) => {
  const validated = await validateSavingsGoal(data);
  return addSavingsGoal(new SavingsGoal(
    validated.name,
    validated.targetAmount,
    validated.currentAmount,
    validated.deadline,
    userId,
  ));
};

export const getUserSavingsGoals = (userId) => getSavingsGoals().filter((goal) => goal.userId === userId);

export const updateSavingsGoalById = async (idData, data, userId) => {
  const { id } = await validateSavingsGoalId(idData);
  if (!findForUser(id, userId)) throw new Error('Savings goal not found.');
  const validated = await validateSavingsGoal(data);
  return updateSavingsGoal(id, validated);
};

export const deleteSavingsGoalById = async (idData, userId) => {
  const { id } = await validateSavingsGoalId(idData);
  if (!findForUser(id, userId) || !deleteSavingsGoal(id)) throw new Error('Savings goal not found.');
};
