import express from 'express'
import userRoutes from './users.routes'
const Router = (app: express.Application) => {
  app.use('/', userRoutes)
}
export default Router
