const express = require('express')
const { register, login, socialLogin, getMe } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/social-login', socialLogin)
router.get('/me', protect, getMe)

module.exports = router
