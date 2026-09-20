import Joi from 'joi';

const savingsGoalSchema = Joi.object({
  name: Joi.string().min(2).max(80).required().messages({
    'string.min': 'Goal name must be at least 2 characters long.',
    'string.max': 'Goal name must not exceed 80 characters.',
    'any.required': 'Goal name is required.',
  }),
  targetAmount: Joi.number().greater(0).required().messages({
    'number.greater': 'Target amount must be greater than zero.',
    'any.required': 'Target amount is required.',
  }),
  currentAmount: Joi.number().min(0).default(0),
  deadline: Joi.date().allow(null, '').optional(),
});

const savingsGoalIdSchema = Joi.object({ id: Joi.number().required() });

export const validateSavingsGoal = async (data) => savingsGoalSchema.validateAsync(data);
export const validateSavingsGoalId = async (data) => savingsGoalIdSchema.validateAsync(data);
