import express from 'express'
import userRoutes from './users.routes'
const Router = (app: express.Application) => {
  app.use('/v1', userRoutes)
}
export default Router
