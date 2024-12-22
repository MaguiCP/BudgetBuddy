class Transaction {
  constructor(description, amount, category, date = new Date()) {
    this.id = Date.now();
    this.category = category;
    this.description = description;
    this.amount = amount;
    this.type = amount > 0 ? 'income' : 'expense';
    this.date = date;
  }
}

let transactions = [];

export const addTransaction = (transaction) => {
  transactions.push(transaction);
};

export const findTransactionById = (id) => {
  return transactions.find(transaction => transaction.id === id);
};

export const updateTransaction = (id, updatedTransaction) => {
  const index = transactions.findIndex(transaction => transaction.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedTransaction };
    return transactions[index];
  }
  return null;
};

export const getTransactions = () => transactions;

export default Transaction;