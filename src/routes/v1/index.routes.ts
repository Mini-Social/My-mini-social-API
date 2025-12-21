import express from 'express'
import userRoutes from './users.routes'
import friendRequestRoutes from './friendRequest.routes'
import postRoutes from './post.routes'
const Router = (app: express.Application) => {
  app.use('/v1/user', userRoutes)
  app.use('/v1/friend-requests', friendRequestRoutes)
  app.use('/v1/post', postRoutes)
}
export default Router
