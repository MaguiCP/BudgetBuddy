import Joi from 'joi';

const transactionSchema = Joi.object({
  description: Joi.string()
    .min(3)
    .required(),
  amount: Joi.number()
    .required()
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