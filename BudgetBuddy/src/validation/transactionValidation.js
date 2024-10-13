import Joi from 'joi';

const transactionSchema = Joi.object({
  description: Joi.string()
    .min(3)
    .required(),
  amount: Joi.number()
    .greater(0)
    .required(),
});

export default transactionSchema;
