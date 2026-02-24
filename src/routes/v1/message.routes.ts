import {
  MarkAsSeen,
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
Router.put('/seenMessage/:conversationId', authMiddleware, MarkAsSeen)
export default Router
