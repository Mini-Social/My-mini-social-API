import { SavePostImages, UploadPostImages } from '@/controllers/post.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addPost', UploadPostImages, SavePostImages)
Router.post('/accept-request/:requestId', authMiddleware)
Router.post('/refused-request/:requestId', authMiddleware)
export default Router
