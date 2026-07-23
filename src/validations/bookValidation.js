const { body } = require('express-validator')

const bookValidationRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('totalCopies').isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer'),
]

module.exports = { bookValidationRules }
