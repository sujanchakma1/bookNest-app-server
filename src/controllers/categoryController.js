const prisma = require('../config/db')
const asyncHandler = require('../utils/asyncHandler')

// @route POST /api/categories (admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ message: 'Category name is required' })

  const category = await prisma.category.create({ data: { name } })
  res.status(201).json(category)
})

// @route DELETE /api/categories/:id (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ message: 'Category deleted' })
})

module.exports = { createCategory, deleteCategory }
