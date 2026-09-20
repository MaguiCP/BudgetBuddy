class Transaction {
  constructor(description, amount, category, userId, date = new Date(), type) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.category = category;
    this.description = description;
    this.type = type || (Number(amount) >= 0 ? 'income' : 'expense');
    this.amount = this.type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    this.date = date;
    this.userId = userId;
  }
}

let transactions = [];

export const addTransaction = (transaction) => {
  transactions.push(transaction);
};

export const findTransactionById = (id) => {
  return transactions.find((transaction) => transaction.id === Number(id));
};

export const updateTransaction = (id, updatedTransaction) => {
  const index = transactions.findIndex((transaction) => transaction.id === Number(id));
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedTransaction };
    return transactions[index];
  }
  return null;
};

export const getTransactions = () => transactions;

export const deleteTransactionById = (id) => {
  const index = transactions.findIndex((transaction) => transaction.id === Number(id));

  if (index === -1) {
    return false;
  }

  transactions.splice(index, 1);
  return true;
};

export default Transaction;