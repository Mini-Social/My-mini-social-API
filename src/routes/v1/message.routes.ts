import {
  SaveMessageImage,
  SendGroupMessage,
  SendPrivateMessage,
  UploadMessageImage
} from '@/controllers/message.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.get('/', authMiddleware)
Router.post('/sendPrivate', authMiddleware, UploadMessageImage, SaveMessageImage, SendPrivateMessage)
Router.post('/sendGroup', authMiddleware, UploadMessageImage, SaveMessageImage, SendGroupMessage)
export default Router
