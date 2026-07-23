const prisma = require('../config/db')
const asyncHandler = require('../utils/asyncHandler')

// @route GET /api/dashboard/stats  (admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBooks, pendingRequests, activeBorrows] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.book.count(),
    prisma.borrowRequest.count({ where: { status: 'PENDING' } }),
    prisma.borrowRequest.count({ where: { status: 'APPROVED' } }),
  ])

  res.json({ totalUsers, totalBooks, pendingRequests, activeBorrows })
})

module.exports = { getDashboardStats }
