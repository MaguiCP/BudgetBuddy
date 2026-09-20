const budgets = [];

export const addBudget = (budget) => {
  budgets.push(budget);
  return budget;
};

export const getBudgets = () => budgets;

export const findBudgetById = (id) => {
  return budgets.find((budget) => budget.id === Number(id));
};

export const updateBudget = (id, updatedBudget) => {
  const index = budgets.findIndex((budget) => budget.id === Number(id));

  if (index === -1) {
    return null;
  }

  budgets[index] = { ...budgets[index], ...updatedBudget };
  return budgets[index];
};

export const deleteBudget = (id) => {
  const index = budgets.findIndex((budget) => budget.id === Number(id));

  if (index === -1) {
    return false;
  }

  budgets.splice(index, 1);
  return true;
};
