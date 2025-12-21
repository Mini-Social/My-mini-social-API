// Load environment variables
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from './constants/enviroments'
import HandleError from './middlewares/handleError'
import Router from './routes/v1/index.routes'
import { connectToDatabase } from './config/mongodb'
import path from 'path'
const app: express.Application = express()
// Port
const port: number = env.PORT
// Middleware
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())
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
