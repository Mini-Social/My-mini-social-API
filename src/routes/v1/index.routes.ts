import express from 'express'
import userRoutes from './users.routes'
import friendRequestRoutes from './friendRequest.routes'
import postRoutes from './post.routes'
import shareRoutes from './share.routes'
import commentRoutes from './comment.routes'
import conversationRoutes from './conversation.routes'
import messageRoutes from './message.routes'
import { HandleNotFound } from '@/controllers/error.controller'
const Router = (app: express.Application) => {
  app.use('/v1/user', userRoutes)
  app.use('/v1/friend-requests', friendRequestRoutes)
  app.use('/v1/post', postRoutes)
  app.use('/v1/share', shareRoutes)
  app.use('/v1/comment', commentRoutes)
  app.use('/v1/conversation', conversationRoutes)
  app.use('/v1/message', messageRoutes)
  app.all('/*splat', HandleNotFound)
}
export default Router
