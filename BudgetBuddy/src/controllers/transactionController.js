import transactionSchema from '../validation/transactionValidation.js';

let transactions = [];

const listTransactions = (req, res) => {
  res.json(transactions);
};

const createTransaction = async (req, res) => {
  try {
    const value = await transactionSchema.validateAsync(req.body);
    transactions.push(value);
    return res.status(201).json({ message: 'Transaction created successfully', transaction: value });
  } catch (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

export { listTransactions, createTransaction };
