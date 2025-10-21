import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { errorHandler } from '@/middlewares/error.middleware'
import routes from '@/routes'

const app = express()
app.use(express.json()) // <--- must be before routes

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

// API ROUTES
app.use('/api/v1', routes)

// error handler (last)
app.use(errorHandler)

export default app
