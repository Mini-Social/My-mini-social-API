import {
  AddComment,
  DeleteComment,
  SaveCommentImage,
  UpdateComment,
  UploadCommentImage
} from '@/controllers/comment.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addComment/:postId', authMiddleware, UploadCommentImage, SaveCommentImage, AddComment)
Router.put('/updateComment/:commentId', authMiddleware, UpdateComment)
Router.delete('/deleteComment/:commentId', authMiddleware, DeleteComment)
export default Router
