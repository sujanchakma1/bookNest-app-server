const express = require('express')
const { register, login, socialLogin, getMe } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')


const router = express.Router()

router.post('/register',upload.single("image"), register)
router.post('/login', login)
router.post('/social-login', socialLogin)
router.get('/me', protect, getMe)

module.exports = router
