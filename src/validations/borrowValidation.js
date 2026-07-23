const { body } = require('express-validator')

const borrowValidationRules = [
  body('bookId').notEmpty().withMessage('bookId is required'),
]

module.exports = { borrowValidationRules }
