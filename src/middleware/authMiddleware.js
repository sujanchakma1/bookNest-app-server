const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

// Verifies the JWT sent by the frontend and attaches req.user
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return res.status(401).json({ message: 'User no longer exists' })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' })
  }
}

module.exports = protect
