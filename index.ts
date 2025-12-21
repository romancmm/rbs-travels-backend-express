import dotenv from 'dotenv'
import app from './src/app'
import { PORT } from './src/config/env'
import { closeRedis, initRedis } from './src/config/redis.config'
dotenv.config()

// Initialize Redis connection
initRedis()

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server gracefully...')
  await closeRedis()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing server gracefully...')
  await closeRedis()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
