import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import { shareSchema } from '@/validate/validate'
import PostModel from '@/models/post.model'

export const AddShare = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { postId } = req.params
  const body = shareSchema.parse(req.body)
  const existPost = await PostModel.findById(postId)
  if (!existPost) {
    return next(new AppError(`No Found post: ${postId}`, 400))
  }
  const newPost = {
    author: id,
    ...body
  }
  existPost.shares.push({ userId: id, sharedAt: new Date(Date.now()) })
  await existPost.save()
  const sharePost = await PostModel.create(newPost)
  if (!sharePost) {
    return next(new AppError(`Could not share post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: sharePost }
  })
})
export const UpdateShare = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { postId } = req.params
  const body = shareSchema.parse(req.body)
  const existPost = await PostModel.findById(postId)
  if (!existPost) {
    return next(new AppError(`No Found post: ${postId}`, 400))
  }
  if (id !== String(existPost.author)) {
    return next(new AppError(`You do not permission to update post: ${postId}`, 400))
  }
  const updateSharePost = await PostModel.findByIdAndUpdate(postId, body, { new: true })
  if (!updateSharePost) {
    return next(new AppError(`Could not share post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: updateSharePost }
  })
})
