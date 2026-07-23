const prisma = require('../config/db')
const asyncHandler = require('../utils/asyncHandler')

// @route GET /api/users  (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
})

// @route PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, photoURL } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, photoURL },
  })
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, photoURL: user.photoURL })
})

// @route PATCH /api/users/:id/role  (admin only) — promote/demote a user
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
  })
  res.json(user)
})

module.exports = { getAllUsers, updateProfile, updateUserRole }
