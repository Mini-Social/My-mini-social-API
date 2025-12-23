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
import { CleanImages } from '@/utils/CleanImages'
export const AddComment = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const deleteUploadedFile = () => {
    if (req.file) CleanImages([req.body.image])
  }
  try {
    const { id } = res.locals.user
    const { postId } = req.params
    const { parentCommentId } = req.body
    const existPost = await PostModel.findById(postId)
    if (!existPost) {
      deleteUploadedFile()
      return next(new AppError('No Found Post', 404))
    }
    if (parentCommentId) {
      const existComment = await CommentModel.findById(parentCommentId)
      if (!existComment) {
        deleteUploadedFile()
        return next(new AppError('No Found Comment', 404))
      }
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
  } catch (error: any) {
    CleanImages([req.body.image])
    return next(new AppError(error.message, 400))
  }
})
export const UpdateComment = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { commentId } = req.params
  const existComment = await CommentModel.findOne({ _id: commentId, deleted: false })
  if (!existComment) {
    return next(new AppError('No Found Comment', 404))
  }
  if (id !== String(existComment.userId)) {
    return next(new AppError(`You do not have permission to update comment: ${commentId}`, 404))
  }
  const body = commentSchema.parse(req.body)
  const updateComment = await CommentModel.findByIdAndUpdate(commentId, body, { new: true })
  res.status(200).json({
    status: 'success',
    data: { comment: updateComment }
  })
})
export const DeleteComment = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { commentId } = req.params
  const existComment = await CommentModel.findOne({ _id: commentId, deleted: false }).select(
    'userId content deleted deletedAt image'
  )
  if (!existComment) {
    return next(new AppError('No Found Comment', 404))
  }
  if (id !== String(existComment.userId)) {
    return next(new AppError(`You do not have permission to delete comment: ${commentId}`, 404))
  }
  if (existComment.image) {
    CleanImages([existComment.image])
  }
  existComment.deleted = true
  existComment.deletedAt = new Date(Date.now())
  existComment.content = 'Bình luận này đã bị xóa'
  existComment.image = null
  await existComment.save()
  res.status(200).json({
    status: 'success',
    message: 'Successfully delete comment'
  })
})
export const GetMainComments = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const existPost = await PostModel.findOne({ _id: postId, deleted: false })
  if (!existPost) {
    return next(new AppError(`No Found Post with id: ${postId}`, 400))
  }
  const comments = await CommentModel.find({ postId: postId, parentCommentId: null, deleted: false })
    .populate('userId', 'username avatar')
    .sort('createdAt')
  res.status(200).json({
    status: 'success',
    length: comments.length,
    data: { comments }
  })
})
export const GetCommentsReplies = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { parentCommentId } = req.params
  const repliesComments = await CommentModel.find({ parentCommentId: parentCommentId, deleted: false })
    .populate('userId', 'username avatar')
    .sort('createdAt')
  res.status(200).json({
    status: 'success',
    length: repliesComments.length,
    data: { repliesComments }
  })
})
export const UploadCommentImage = upload.single('image')
export const SaveCommentImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  const targetDir = path.join(__dirname, '../../public/img/posts')
  const commentId = uuidv4()
  const fileName = `commentId-${commentId}-${Date.now()}.jpeg`
  await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`${targetDir}/${fileName}`)
  req.body.image = fileName
  next()
}
