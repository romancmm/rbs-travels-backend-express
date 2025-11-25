import swaggerSpec from '@/docs/openapi'
import type { NextFunction, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

// Basic Auth middleware for Swagger UI
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"')
    return res.status(401).send('Authentication required')
  }

  const base64Credentials = authHeader.split(' ')[1]
  if (!base64Credentials) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"')
    return res.status(401).send('Authentication required')
  }

  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = credentials.split(':')

  // Change these credentials as needed
  const validUsername = process.env.DOCS_USERNAME || 'admin'
  const validPassword = process.env.DOCS_PASSWORD || 'secret123'

  if (username === validUsername && password === validPassword) {
    return next()
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"')
  return res.status(401).send('Invalid credentials')
}

// Swagger UI configuration with advanced features
export const swaggerOptions = {
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

// Swagger UI setup
export const swaggerServe = swaggerUi.serve
export const swaggerSetup = swaggerUi.setup(swaggerSpec, swaggerOptions)
export { swaggerSpec }
