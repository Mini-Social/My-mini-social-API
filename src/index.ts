// Load environment variables
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from './constants/enviroments'
import HandleError from './middlewares/handleError'
import Router from './routes/v1/index.routes'
import { connectToDatabase } from './config/mongodb'
import path from 'path'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import UserModel from './models/user.model'
const app: express.Application = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

let users: { userId: string; socketId: string }[] = []
const addUser = (userId: string, socketId: string) => {
  if (!users.some((u) => u.userId === userId)) {
    users.push({ userId, socketId })
  }
}
const removeUser = (socketId: string) => {
  users = users.filter((u) => u.socketId !== socketId)
}
const getUser = (receiverId: string) => {
  return users.find((u) => u.userId === receiverId)
}
io.on('connection', (socket) => {
  socket.on('addUser', async (userId) => {
    ;(socket as any).userId = userId
    addUser(userId, socket.id)
    io.emit('getUser', users)
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        lastOnline: null,
        isOnline: true
      },
      { new: true }
    )
  })
  socket.on('sendMessage', ({ receiverId, messageData }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit('getMessage', { messageData })
    }
  })
  socket.on('typing', ({ receiverId }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit('typing')
    }
  })
  socket.on('cancelTyping', ({ receiverId }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit('cancelTyping')
    }
  })
  socket.on('disconnect', async () => {
    const userId = (socket as any).userId
    const user = getUser(userId)
    if (user) {
      await UserModel.findOneAndUpdate(
        { _id: user.userId },
        {
          lastOnline: new Date(),
          isOnline: false
        },
        { new: true }
      )
    }
    removeUser(socket.id)
    io.emit('getUser', users)
  })
})
// Port
const port: number = env.PORT
// Middleware
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cookieParser())
// Routes
Router(app)
// Error handling middleware
app.use(HandleError)
// Connect to MongoDB
connectToDatabase().then(() => {
  // Start server
  server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })
})
