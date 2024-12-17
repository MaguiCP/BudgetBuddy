class Transaction {
  constructor(description, amount, category) {
    this.id = Transaction.generateId();
    this.category = category;
    this.description = description;
    this.amount = amount;
    this.type = amount > 0 ? 'income' : 'expense';
  }

  static generateId() {
    return Math.floor(Math.random() * 1000000);
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