const savingsGoals = [];

export const addSavingsGoal = (goal) => {
  savingsGoals.push(goal);
  return goal;
};

export const getSavingsGoals = () => savingsGoals;

export const findSavingsGoalById = (id) => savingsGoals.find((goal) => goal.id === Number(id));

export const updateSavingsGoal = (id, data) => {
  const index = savingsGoals.findIndex((goal) => goal.id === Number(id));
  if (index === -1) return null;
  savingsGoals[index] = { ...savingsGoals[index], ...data };
  return savingsGoals[index];
};

export const deleteSavingsGoal = (id) => {
  const index = savingsGoals.findIndex((goal) => goal.id === Number(id));
  if (index === -1) return false;
  savingsGoals.splice(index, 1);
  return true;
};
