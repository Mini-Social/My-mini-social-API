import {
  AddComment,
  DeleteComment,
  GetCommentsReplies,
  GetMainComments,
  SaveCommentImage,
  UpdateComment,
  UploadCommentImage
} from '@/controllers/comment.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.get('/getComments/:postId', GetMainComments)
Router.get('/getCommentsReplies/:parentCommentId', GetCommentsReplies)
Router.post('/addComment/:postId', authMiddleware, UploadCommentImage, SaveCommentImage, AddComment)
Router.put('/updateComment/:commentId', authMiddleware, UpdateComment)
Router.delete('/deleteComment/:commentId', authMiddleware, DeleteComment)
export default Router
