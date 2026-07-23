const express = require('express')
const {
  requestBorrow, getMyBorrows, getAllBorrowRequests,
  approveBorrowRequest, rejectBorrowRequest, returnBook,
} = require('../controllers/borrowController')
const protect = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = express.Router()

router.post('/', protect, requestBorrow)
router.get('/my', protect, getMyBorrows)
router.get('/', protect, requireRole('ADMIN'), getAllBorrowRequests)
router.patch('/:id/approve', protect, requireRole('ADMIN'), approveBorrowRequest)
router.patch('/:id/reject', protect, requireRole('ADMIN'), rejectBorrowRequest)
router.patch('/:id/return', protect, returnBook)

module.exports = router
