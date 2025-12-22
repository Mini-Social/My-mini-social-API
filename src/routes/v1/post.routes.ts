import {
  AddPost,
  DeletePost,
  GetAllPost,
  GetPostById,
  SavePostImages,
  SoftDeletePost,
  UpdatePost,
  UploadPostImages
} from '@/controllers/post.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.get('/getPost/:postId', authMiddleware, GetPostById)
Router.get('/getAllPost', authMiddleware, GetAllPost)
Router.post('/addPost', authMiddleware, UploadPostImages, SavePostImages, AddPost)
Router.put('/updatePost/:postId', authMiddleware, UploadPostImages, SavePostImages, UpdatePost)
Router.delete('/softDeletePost/:postId', authMiddleware, SoftDeletePost)
Router.delete('/deletePost/:postId', authMiddleware, DeletePost)
export default Router
