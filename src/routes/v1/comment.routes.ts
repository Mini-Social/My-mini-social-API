import { AddComment, SavePostImage, UpdateComment, UploadPostImage } from '@/controllers/comment.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addComment/:postId', authMiddleware, UploadPostImage, SavePostImage, AddComment)
Router.put('/updateComment/:commentId', authMiddleware, UpdateComment)
export default Router
