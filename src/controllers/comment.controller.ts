import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import PostModel from '@/models/post.model'
import { commentSchema } from '@/validate/validate'
import CommentModel from '@/models/comment.model'
import { upload } from '@/services/multer'
import sharp from 'sharp'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
export const AddComment = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { postId } = req.params
  const { parentCommentId } = req.body
  const existPost = await PostModel.findById(postId)
  if (!existPost) {
    return next(new AppError('No Found Post', 404))
  }
  const body = commentSchema.parse(req.body)
  const data = {
    postId,
    userId: id,
    ...body,
    parentCommentId: parentCommentId || null
  }
  const newComment = await CommentModel.create(data)
  res.status(200).json({
    status: 'success',
    data: { comment: newComment }
  })
})

export const UploadPostImage = upload.single('image')
export const SavePostImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  const targetDir = path.join(__dirname, '../../public/img/posts')
  const commentId = uuidv4()
  const fileName = `commentId-${commentId}-${Date.now()}.jpeg`
  await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`${targetDir}/${fileName}`)
  req.body.image = fileName
  next()
}
