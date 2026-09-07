class Transaction {
  constructor(description, amount, category, userId, date = new Date()) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.category = category;
    this.description = description;
    this.amount = Number(amount);
    this.type = this.amount > 0 ? 'income' : 'expense';
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