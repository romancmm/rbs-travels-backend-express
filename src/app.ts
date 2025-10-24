import swaggerSpec from '@/docs/openapi'
import { errorHandler } from '@/middlewares/error.middleware'
import routes from '@/routes'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'

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
// Swagger UI & JSON spec
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))
app.use(errorHandler)

export default app
