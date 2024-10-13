import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: Joi.string()
    .min(8)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user'),
});

export default userSchema;
