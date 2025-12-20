import express from 'express'
import userRoutes from './users.routes'
import friendRequestRoutes from './friendrequest.routes'
const Router = (app: express.Application) => {
  app.use('/v1/user', userRoutes)
  app.use('/v1/friend-requests', friendRequestRoutes)
}
export default Router
