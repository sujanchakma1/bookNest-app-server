const express = require('express')
const { getCategories } = require('../controllers/bookController')
const { createCategory, deleteCategory } = require('../controllers/categoryController')
const protect = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', getCategories)
router.post('/', protect, requireRole('ADMIN'), createCategory)
router.delete('/:id', protect, requireRole('ADMIN'), deleteCategory)

module.exports = router
