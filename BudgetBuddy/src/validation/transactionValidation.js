import Joi from 'joi';

const allowedCategories = ['groceries', 'transportation', 'entertainment', 'income', 'others'];

const transactionSchema = Joi.object({
  description: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.base': 'Description must be a string.',
      'string.min': 'Description must be at least 3 characters long.',
      'any.required': 'Description is required.',
    }),
  amount: Joi.number()
    .required()
    .messages({
      'number.base': 'Amount must be a number.',
      'any.required': 'Amount is required.',
    }),
  category: Joi.string()
    .valid(...allowedCategories)
    .required()
    .messages({
      'any.only': `Category must be one of: ${allowedCategories.join(', ')}`,
      'any.required': 'Category is required.',
    }),
});

const transactionIdSchema = Joi.object({
  id: Joi.number()
    .required()
    .messages({
      'number.base': 'ID must be a number.',
      'any.required': 'ID is required.',
    }),
});

export const validateTransaction = async (data) => {
  return await transactionSchema.validateAsync(data);
};

export const validateTransactionId = async (data) => {
  return await transactionIdSchema.validateAsync(data);
};