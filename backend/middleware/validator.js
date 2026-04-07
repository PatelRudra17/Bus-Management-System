const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation rules
const validators = {
  // User validation
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone is required')
      .matches(/^[+]?[0-9]{7,15}$/).withMessage('Invalid phone number'),
    validate
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[0-9]{7,15}$/).withMessage('Invalid phone number'),
    validate
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate
  ],

  // Application validation
  createApplication: [
    body('passType')
      .notEmpty().withMessage('Pass type is required')
      .isIn(['student', 'general', 'senior', 'disabled']).withMessage('Invalid pass type'),
    body('duration')
      .notEmpty().withMessage('Duration is required')
      .isIn(['1month', '3months', '6months', '12months']).withMessage('Invalid duration'),
    body('routeId')
      .notEmpty().withMessage('Route is required')
      .isMongoId().withMessage('Invalid route ID'),
    body('startDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    body('idProof')
      .notEmpty().withMessage('ID proof is required')
      .custom(value => value.startsWith('data:image')).withMessage('ID proof must be a valid image'),
    body('photo')
      .notEmpty().withMessage('Photo is required')
      .custom(value => value.startsWith('data:image')).withMessage('Photo must be a valid image'),
    validate
  ],

  // Route validation
  createRoute: [
    body('routeNumber')
      .trim()
      .notEmpty().withMessage('Route number is required'),
    body('source')
      .trim()
      .notEmpty().withMessage('Source location is required'),
    body('destination')
      .trim()
      .notEmpty().withMessage('Destination location is required'),
    body('fare')
      .notEmpty().withMessage('Fare is required')
      .isNumeric().withMessage('Fare must be a number')
      .custom(value => value > 0).withMessage('Fare must be greater than 0'),
    validate
  ],

  // Payment validation
  createPayment: [
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isNumeric().withMessage('Amount must be a number')
      .custom(value => value > 0).withMessage('Amount must be greater than 0'),
    body('paymentMethod')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment method'),
    validate
  ],

  // MongoDB ID validation
  mongoId: [
    param('id').isMongoId().withMessage('Invalid ID format'),
    validate
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ]
};

module.exports = { validate, validators };
