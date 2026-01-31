const Joi = require('joi');

// Register validation
const registerValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email must be valid',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      }),
    firstName: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'Last name is required'
      }),
    userType: Joi.string()
      .valid('CUSTOMER', 'SHOP_OWNER')
      .default('CUSTOMER')
  });

  return schema.validate(data, { abortEarly: false });
};

// Login validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email must be valid',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation
};
