import {
  CreateGroupChat,
  CreatePrivateChat,
  SaveConversationImage,
  ToggleGroupMember,
  UpdateGroupChat,
  UploadConversationImage
} from '@/controllers/conversation.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/createPrivate/:userId', authMiddleware, CreatePrivateChat)
Router.post('/createGroup', authMiddleware, CreateGroupChat)
Router.put(
  '/updateGroup/:conversationId',
  authMiddleware,
  UploadConversationImage,
  SaveConversationImage,
  UpdateGroupChat
)
Router.put('/toggleMember/:conversationId/:action', authMiddleware, ToggleGroupMember)
export default Router
