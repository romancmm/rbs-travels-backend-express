import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
// import authRoutes from './routes/auth.route'
// import toursRoutes from './routes/tours.route'
// import pagesRoutes from './routes/pages.route'
import { errorHandler } from './middlewares/error.middleware'

const app = express()

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

const limiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 200,
})
app.use(limiter)

// routes
// app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/tours', toursRoutes)
// app.use('/api/v1/pages', pagesRoutes)

// health
app.get('/health', (_, res) => res.json({ ok: true }))

// error handler (last)
app.use(errorHandler)

export default app
