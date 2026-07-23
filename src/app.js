const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const bookRoutes = require('./routes/bookRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const borrowRoutes = require('./routes/borrowRoutes')
const userRoutes = require('./routes/userRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

app.use(helmet())
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BookNest API is running 🚀",
  });
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'BookNest API' }))

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/borrow', borrowRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
