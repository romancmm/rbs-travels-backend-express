import app from '@/app'
import { PORT } from '@/config/env'
import dotenv from 'dotenv'
dotenv.config()

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  server.close(() => process.exit(1))
})
