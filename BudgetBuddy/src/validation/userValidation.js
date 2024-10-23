import Joi from 'joi';

const userRegistrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Username cannot be empty.',
      'string.alphanum': 'Username must contain only alphanumeric characters.',
      'string.min': 'Username must be at least 3 characters long.',
      'string.max': 'Username must be at most 30 characters long.',
      'any.required': 'Username is required.',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password cannot be empty.',
      'string.min': 'Password must be at least 8 characters long.',
      'any.required': 'Password is required.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email cannot be empty.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either "user" or "admin".',
    }),
});

const userLoginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'string.empty': 'Username is required.',
      'any.required': 'Username is required.',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.',
    }),
});

const userIdSchema = Joi.object({
  id: Joi.number()
    .required()
    .messages({
      'number.base': 'ID must be a number.',
      'any.required': 'ID is required.',
    }),
});


export const validateUserRegistration = async (data) => {
  return await userRegistrationSchema.validateAsync(data);
};

export const validateUserLogin = async (data) => {
  return await userLoginSchema.validateAsync(data);
};

export const validateUserId = async (data) => {
  return await userIdSchema.validateAsync(data);
};
