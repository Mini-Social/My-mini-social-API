import {
  CreateGroupChat,
  CreatePrivateChat,
  GetConversation,
  GetMessage,
  LeaveGroup,
  SaveConversationImage,
  ToggleGroupMember,
  UpdateGroupChat,
  UploadConversationImage
} from '@/controllers/conversation.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.get('/', authMiddleware, GetConversation)
Router.get('/:conversationId/messages', authMiddleware, GetMessage)
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
Router.put('/leaveGroup/:conversationId', authMiddleware, LeaveGroup)
export default Router
