import { RestorePost } from '@/controllers/post.controller'
import { AddShare, DeleteShare, UpdateShare } from '@/controllers/share.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import express from 'express'
const Router = express.Router()

Router.post('/addShare/:postId', authMiddleware, AddShare)
Router.put('/updateShare/:postId', authMiddleware, UpdateShare)
Router.put('/restorePost/:postId', authMiddleware, RestorePost)
Router.delete('/deleteShare/:postId', authMiddleware, DeleteShare)
export default Router
