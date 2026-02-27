import {
  AcceptFriendRequest,
  CancelFriendRequest,
  getFriendRequests,
  getSentFriendRequests,
  RefusedFriendRequest,
  SendFriendRequest
} from '@/controllers/friendRequest.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/send-request/:id', authMiddleware, SendFriendRequest)
Router.get('/get-requests', authMiddleware, getFriendRequests)
Router.get('/get-sent-requests', authMiddleware, getSentFriendRequests)
Router.put('/accept-request/:requestId', authMiddleware, AcceptFriendRequest)
Router.put('/refused-request/:requestId', authMiddleware, RefusedFriendRequest)
Router.put('/cancel-request/:requestId', authMiddleware, CancelFriendRequest)
export default Router
