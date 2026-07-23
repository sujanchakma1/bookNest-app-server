const express = require('express')
const {
  getBooks, getBookById, createBook, updateBook, deleteBook, getCategories,
} = require('../controllers/bookController')
const protect = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/', getBooks)
router.get('/:id', getBookById)
router.post('/', protect, requireRole('ADMIN'), upload.single('cover'), createBook)
router.patch('/:id', protect, requireRole('ADMIN'), updateBook)
router.delete('/:id', protect, requireRole('ADMIN'), deleteBook)

module.exports = router
