import swaggerSpec from '@/docs/openapi'
import { errorHandler } from '@/middlewares/error.middleware'
import routes from '@/routes'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import swaggerUi from 'swagger-ui-express'

const app = express()
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
})
app.use(limiter)

// API ROUTES
app.use('/api/v1', routes)

// Swagger UI configuration with advanced features
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none', // All groups collapsed by default
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    displayRequestDuration: true,
    filter: true, // Enable search/filter
    showExtensions: true,
    showCommonExtensions: true,
    persistAuthorization: true, // Persist auth token in localStorage
    tryItOutEnabled: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .information-container { margin: 20px 0; }
    .swagger-ui .scheme-container { margin: 20px 0; padding: 20px; background: #fafafa; border-radius: 4px; }
    #auth-indicator { 
      position: fixed; 
      top: 10px; 
      right: 10px; 
      padding: 8px 16px; 
      border-radius: 4px; 
      background: #f93e3e; 
      color: white; 
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
    }
    #auth-indicator.authenticated { background: #49cc90; }
  `,
  customJs: '/swagger-auth.js',
  customSiteTitle: 'Travel Agency API Documentation',
}

// Swagger UI & JSON spec
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions))
app.get('/docs.json', (_req, res) => res.json(swaggerSpec))

// error handler (must be last)
app.use(errorHandler)

export default app
