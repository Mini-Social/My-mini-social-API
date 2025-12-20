import { SendFriendRequest } from '@/controllers/friendRequest.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/send-request/:id', authMiddleware, SendFriendRequest)
export default Router
