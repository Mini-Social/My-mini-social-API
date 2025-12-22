import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import { shareSchema } from '@/validate/validate'
import PostModel from '@/models/post.model'

export const AddShare = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const body = shareSchema.parse(req.body)
  const existPost = await PostModel.findById(body.sharePostId)
  if (!existPost) {
    return next(new AppError(`No Found post: ${body.sharePostId}`, 400))
  }
  const newPost = {
    author: id,
    ...body
  }
  existPost.shares.push({ userId: id, sharedAt: new Date(Date.now()) })
  await existPost.save()
  const sharePost = await PostModel.create(newPost)
  if (!sharePost) {
    return next(new AppError(`Could not share post: ${body.sharePostId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: sharePost }
  })
})
