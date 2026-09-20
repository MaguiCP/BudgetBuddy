import {
  createSavingsGoal,
  deleteSavingsGoalById,
  getUserSavingsGoals,
  updateSavingsGoalById,
} from '../services/savingsGoalService.js';

const createGoal = async (req, res) => {
  try {
    return res.status(201).json({ goal: await createSavingsGoal(req.body, req.user.id) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getGoals = (req, res) => res.status(200).json(getUserSavingsGoals(req.user.id));

const updateGoal = async (req, res) => {
  try {
    return res.status(200).json({ goal: await updateSavingsGoalById(req.params, req.body, req.user.id) });
  } catch (error) {
    return res.status(error.message === 'Savings goal not found.' ? 404 : 400).json({ error: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await deleteSavingsGoalById(req.params, req.user.id);
    return res.status(200).json({ message: 'Savings goal deleted successfully.' });
  } catch (error) {
    return res.status(error.message === 'Savings goal not found.' ? 404 : 400).json({ error: error.message });
  }
};

export { createGoal, getGoals, updateGoal, deleteGoal };
