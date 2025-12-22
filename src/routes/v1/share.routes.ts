import { AddShare } from '@/controllers/share.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addShare', authMiddleware, AddShare)
Router.post('/accept-request/:requestId', authMiddleware)
Router.post('/refused-request/:requestId', authMiddleware)
export default Router
