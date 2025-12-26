import { CreateGroupChat, CreatePrivateChat } from '@/controllers/conversation.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/createPrivate/:userId', authMiddleware, CreatePrivateChat)
Router.post('/createGroup', authMiddleware, CreateGroupChat)
export default Router
