const express = require('express')
const { getDashboardStats } = require('../controllers/dashboardController')
const protect = require('../middleware/authMiddleware')
const requireRole = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/stats', protect, requireRole('ADMIN'), getDashboardStats)

module.exports = router
