import dotenv from 'dotenv'
import app from './src/app'
import { PORT } from './src/config/env'
dotenv.config()

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})
