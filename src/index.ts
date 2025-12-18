// Load environment variables
import cors from 'cors'
import express from 'express'
import { env } from './constants/enviroments'
import HandleError from './middlewares/handleError'
import Router from './routes/v1/index.routes'
import { connectToDatabase } from './config/mongodb'
const app: express.Application = express()
// Port
const port: number = env.PORT
// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
// Connect to MongoDB
connectToDatabase()
// Routes
Router(app)
// Error handling middleware
app.use(HandleError)
// Start server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
