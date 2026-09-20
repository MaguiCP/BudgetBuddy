import Joi from 'joi';

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
    .custom((value, helpers) => {
      if (value === 0) {
        return helpers.error('number.positive');
      }

      return value;
    })
    .required()
    .messages({
      'number.base': 'Amount must be a number.',
      'number.positive': 'Amount cannot be zero.',
      'any.required': 'Amount is required.',
    }),
  type: Joi.string()
    .valid('income', 'expense')
    .optional()
    .messages({
      'any.only': 'Type must be either income or expense.',
    }),
  category: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Category must be a string.',
      'string.min': 'Category must be at least 2 characters long.',
      'string.max': 'Category must not exceed 50 characters.',
      'any.required': 'Category is required.',
    }),
  date: Joi.date().optional(),
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