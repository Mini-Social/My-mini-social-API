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
    ...body,
    sharePostId: postId
  }
  const sharePost = await PostModel.create(newPost)
  if (!sharePost) {
    return next(new AppError(`Could not share post: ${postId}`, 400))
  }
  existPost.shares.push({ userId: id, sharePostId: sharePost._id, sharedAt: new Date(Date.now()) })
  await existPost.save()
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
    return next(new AppError(`Could not update share post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: updateSharePost }
  })
})
export const DeleteShare = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { postId } = req.params
  const existPost = await PostModel.findById(postId)
  if (!existPost) {
    return next(new AppError(`No Found post: ${postId}`, 400))
  }
  if (id !== String(existPost.author)) {
    return next(new AppError(`You do not permission to delete post: ${postId}`, 400))
  }
  const deleteSharePost = await PostModel.findByIdAndUpdate(
    postId,
    { deleted: true, deletedAt: Date.now() },
    { new: true }
  )
  if (!deleteSharePost) {
    return next(new AppError(`Could not delete share post: ${postId}`, 400))
  }
  const originPost = await PostModel.findByIdAndUpdate(existPost.sharePostId, {
    $pull: { shares: { sharePostId: existPost._id } }
  })
  if (!originPost) {
    return next(new AppError(`Could not update post: ${existPost.sharePostId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: deleteSharePost }
  })
})
