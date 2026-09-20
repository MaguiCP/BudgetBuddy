const recurringTransactions = [];

export const addRecurringTransaction = (transaction) => {
  recurringTransactions.push(transaction);
  return transaction;
};
export const getRecurringTransactions = () => recurringTransactions;
export const findRecurringTransactionById = (id) => recurringTransactions.find((item) => item.id === Number(id));
export const updateRecurringTransaction = (id, data) => {
  const index = recurringTransactions.findIndex((item) => item.id === Number(id));
  if (index === -1) return null;
  recurringTransactions[index] = { ...recurringTransactions[index], ...data };
  return recurringTransactions[index];
};
export const deleteRecurringTransaction = (id) => {
  const index = recurringTransactions.findIndex((item) => item.id === Number(id));
  if (index === -1) return false;
  recurringTransactions.splice(index, 1);
  return true;
};
