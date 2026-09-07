import Joi from 'joi';

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Category name is required.',
    'string.min': 'Category name must be at least 2 characters long.',
    'any.required': 'Category name is required.',
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type must be either "income" or "expense".',
    'any.required': 'Type is required.',
  }),
});

const categoryIdSchema = Joi.object({
  id: Joi.number().required().messages({
    'number.base': 'ID must be a number.',
    'any.required': 'ID is required.',
  }),
});

export const validateCategory = async (data) => {
  return await categorySchema.validateAsync(data);
};

export const validateCategoryId = async (data) => {
  return await categoryIdSchema.validateAsync(data);
};
