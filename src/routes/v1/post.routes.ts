import { AddPost, SavePostImages, UpdatePost, UploadPostImages } from '@/controllers/post.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addPost', authMiddleware, UploadPostImages, SavePostImages, AddPost)
Router.put('/updatePost/:postId', authMiddleware, UploadPostImages, SavePostImages, UpdatePost)
export default Router
