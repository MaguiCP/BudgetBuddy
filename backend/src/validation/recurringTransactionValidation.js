import Joi from 'joi';

const recurringSchema = Joi.object({
  description: Joi.string().min(3).required(),
  amount: Joi.number().greater(0).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().min(2).max(50).required(),
  frequency: Joi.string().valid('monthly').default('monthly'),
  nextDate: Joi.date().required(),
  active: Joi.boolean().default(true),
});

const idSchema = Joi.object({ id: Joi.number().required() });
export const validateRecurringTransaction = async (data) => recurringSchema.validateAsync(data);
export const validateRecurringTransactionId = async (data) => idSchema.validateAsync(data);
