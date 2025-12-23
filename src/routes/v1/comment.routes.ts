import { AddComment, SavePostImage, UploadPostImage } from '@/controllers/comment.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addComment/:postId', authMiddleware, UploadPostImage, SavePostImage, AddComment)
export default Router
