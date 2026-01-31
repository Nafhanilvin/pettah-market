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

// Create shop validation
const createShopValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .max(100)
      .messages({
        'any.required': 'Shop name is required',
        'string.max': 'Shop name cannot exceed 100 characters'
      }),
    description: Joi.string()
      .max(1000)
      .optional(),
    category: Joi.string()
      .required()
      .valid(
        'Electronics',
        'Clothing',
        'Food & Beverages',
        'Home & Garden',
        'Health & Beauty',
        'Books & Media',
        'Sports & Outdoors',
        'Toys & Games',
        'Automotive',
        'Services',
        'Other'
      )
      .messages({
        'any.required': 'Category is required'
      }),
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Phone number is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be valid'
      }),
    website: Joi.string()
      .uri()
      .optional(),
    street: Joi.string()
      .required()
      .messages({
        'any.required': 'Street address is required'
      }),
    city: Joi.string()
      .required()
      .messages({
        'any.required': 'City is required'
      }),
    district: Joi.string()
      .required()
      .messages({
        'any.required': 'District is required'
      }),
    postalCode: Joi.string()
      .optional(),
    about: Joi.string()
      .max(2000)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Update shop validation
const updateShopValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .max(100)
      .optional(),
    description: Joi.string()
      .max(1000)
      .optional(),
    category: Joi.string()
      .optional()
      .valid(
        'Electronics',
        'Clothing',
        'Food & Beverages',
        'Home & Garden',
        'Health & Beauty',
        'Books & Media',
        'Sports & Outdoors',
        'Toys & Games',
        'Automotive',
        'Services',
        'Other'
      ),
    phone: Joi.string()
      .optional(),
    email: Joi.string()
      .email()
      .optional(),
    website: Joi.string()
      .uri()
      .optional(),
    street: Joi.string()
      .optional(),
    city: Joi.string()
      .optional(),
    district: Joi.string()
      .optional(),
    postalCode: Joi.string()
      .optional(),
    about: Joi.string()
      .max(2000)
      .optional(),
    openingHours: Joi.object()
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  registerValidation,
  loginValidation,
  createShopValidation,
  updateShopValidation
};
