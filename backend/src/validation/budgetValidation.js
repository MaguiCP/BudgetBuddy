import Joi from 'joi';

const budgetSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Month must use the YYYY-MM format.',
      'any.required': 'Month is required.',
    }),
  category: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Category must be at least 2 characters long.',
    'string.max': 'Category must not exceed 50 characters.',
    'any.required': 'Category is required.',
  }),
  amount: Joi.number().greater(0).required().messages({
    'number.greater': 'Budget amount must be greater than zero.',
    'any.required': 'Budget amount is required.',
  }),
});

const budgetIdSchema = Joi.object({
  id: Joi.number().required(),
});

export const validateBudget = async (data) => budgetSchema.validateAsync(data);
export const validateBudgetId = async (data) => budgetIdSchema.validateAsync(data);
