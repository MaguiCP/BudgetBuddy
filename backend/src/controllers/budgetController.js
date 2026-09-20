import {
  createBudget,
  deleteBudgetById,
  getUserBudgets,
  updateBudgetById,
} from '../services/budgetService.js';

const createBudgetController = async (req, res) => {
  try {
    const budget = await createBudget(req.body, req.user.id);
    return res.status(201).json({ budget });
  } catch (error) {
    const status = error.message.startsWith('A budget already') ? 409 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const getBudgetsController = (req, res) => {
  return res.status(200).json(getUserBudgets(req.user.id, req.query.month));
};

const updateBudgetController = async (req, res) => {
  try {
    const budget = await updateBudgetById(req.params, req.body, req.user.id);
    return res.status(200).json({ budget });
  } catch (error) {
    const status = error.message === 'Budget not found.' ? 404 : error.message.startsWith('A budget already') ? 409 : 400;
    return res.status(status).json({ error: error.message });
  }
};

const deleteBudgetController = async (req, res) => {
  try {
    await deleteBudgetById(req.params, req.user.id);
    return res.status(200).json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    const status = error.message === 'Budget not found.' ? 404 : 400;
    return res.status(status).json({ error: error.message });
  }
};

export {
  createBudgetController,
  getBudgetsController,
  updateBudgetController,
  deleteBudgetController,
};
