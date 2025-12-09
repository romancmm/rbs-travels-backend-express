import { basicAuth, swaggerServe, swaggerSetup, swaggerSpec } from '@/config/swagger.config'
import { errorHandler } from '@/middlewares/error.middleware'
import routes from '@/routes'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'

const app = express()

// Trust proxy - enables Express to trust reverse proxy headers
// Use 'true' if behind a single proxy (nginx, Apache)
// Use number for specific number of hops (e.g., 1, 2)
// Use 'loopback' for localhost proxy only
app.set('trust proxy', true)

app.use(express.json()) // <--- must be before routes

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')))

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for trusted proxies or disable if needed
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'
  },
})
app.use(limiter)

// API ROUTES V1
app.use('/api/v1', routes)

// Protect Swagger UI with Basic Auth
app.use('/docs', basicAuth, swaggerServe, swaggerSetup)
app.get('/docs.json', basicAuth, (_req, res) => res.json(swaggerSpec))

// error handler (must be last)
app.use(errorHandler)

export default app
