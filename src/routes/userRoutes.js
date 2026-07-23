const express = require('express')
const { getAllUsers, updateProfile, updateUserRole } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', protect, requireRole('ADMIN'), getAllUsers)
router.patch('/me', protect, updateProfile)
router.patch('/:id/role', protect, requireRole('ADMIN'), updateUserRole)

module.exports = router
