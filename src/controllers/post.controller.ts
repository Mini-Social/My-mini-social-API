import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import { upload } from '@/services/multer'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { postSchema } from '@/validate/validate'
import PostModel from '@/models/post.model'
import mongoose from 'mongoose'
import { CleanImages } from '@/utils/CleanImages'
export const UploadPostImages = upload.array('images', 6)
export const SavePostImages = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) return next()
  const postId = uuidv4()
  const promiseFiles = (req.files as Express.Multer.File[]).map(async (file, index) => {
    const filename = `post-${postId}-${Date.now()}-${index + 1}.jpeg`
    const targetDir = path.join(__dirname, '../../public/img/posts')
    await sharp(file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90, mozjpeg: true, progressive: true })
      .toFile(`${targetDir}/${filename}`)
    return filename
  })
  const images = await Promise.all(promiseFiles)
  req.body.images = images
  next()
})
export const AddPost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = postSchema.parse(req.body)
    const { id } = res.locals.user

    const newPost = await PostModel.create({ author: id, ...body })
    if (!newPost) {
      return next(new AppError('Could not add new post', 400))
    }
    res.status(200).json({
      status: 'success',
      data: {
        post: newPost
      }
    })
  } catch (error: any) {
    CleanImages(req.body.images)
    return next(new AppError(error.message, 400))
  }
})
export const UpdatePost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const { id } = res.locals.user
  const body = postSchema.partial().parse(req.body)
  const post = await PostModel.findById(postId).select('images author')
  if (body.images && body.images.length > 0) {
    if (post?.images) {
      CleanImages([...post.images])
    }
  } else {
    delete body.images
  }
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  if (id !== String(post.author)) {
    return next(new AppError('You do not have permission to update this post', 400))
  }
  const updatePost = await PostModel.findByIdAndUpdate(postId, body, { new: true })
  if (!updatePost) {
    return next(new AppError(`Could not update post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post: updatePost }
  })
})
export const DeletePost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const post = await PostModel.findById(postId).select('images author')
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  if (id !== String(post.author)) {
    return next(new AppError('You do not have permission to update this post', 400))
  }
  const deletePost = await PostModel.findByIdAndDelete(postId)
  if (!deletePost) {
    return next(new AppError(`Could not delete post: ${postId}`, 400))
  } else {
    CleanImages([...deletePost.images])
  }
  res.status(200).json({
    message: 'Successfully deleted.'
  })
})
export const GetPostById = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const post = await PostModel.findOne({ _id: postId, deleted: false })
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { post }
  })
})
export const GetPostByUserId = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const posts = await PostModel.find({ author: id, deleted: false })
  res.status(200).json({
    status: 'success',
    data: { posts }
  })
})
export const GetAllPost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const posts = await PostModel.find({ deleted: false })
  res.status(200).json({
    status: 'success',
    data: { posts }
  })
})
export const SoftDeletePost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const post = await PostModel.findOne({ _id: postId, deleted: false }).select('images author')
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  if (id !== String(post.author)) {
    return next(new AppError('You do not have permission to update this post', 400))
  }
  const deletePost = await PostModel.findByIdAndUpdate(postId, { deleted: true, deletedAt: Date.now() })
  if (!deletePost) {
    return next(new AppError(`Could not delete post: ${postId}`, 400))
  }
  res.status(200).json({
    message: 'Successfully deleted.'
  })
})
export const GetTrashPost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const posts = await PostModel.find({ author: id, deleted: true })
  res.status(200).json({
    status: 'success',
    data: { posts }
  })
})
export const RestorePost = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const post = await PostModel.findById(postId).select('images author deleted sharePostId')
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  if (id !== String(post.author)) {
    return next(new AppError('You do not have permission to restore this post.', 400))
  }
  if (!post.deleted) {
    return next(new AppError('This post is now public.', 400))
  }
  post.deleted = false
  post.deletedAt = null
  await post.save()
  if (post.sharePostId) {
    const data = {
      userId: id,
      sharePostId: post._id,
      shareAt: Date.now()
    }
    await PostModel.findByIdAndUpdate(post.sharePostId, {
      $push: { shares: data }
    })
  }
  res.status(200).json({
    status: 'success',
    message: `Succesfully restore post: ${post._id}`
  })
})
export const HandleReactions = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const { postId, action } = req.params
  const idValid = CheckInvalidId(postId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const reactionsAdd = ['like', 'love', 'haha', 'wow', 'sad', 'angry']
  const reactionsRemove = ['unlike', 'unlove', 'unhaha', 'unwow', 'unsad', 'unangry']

  if (!reactionsAdd.concat(reactionsRemove).includes(action)) {
    return next(new AppError('Invalid Action', 400))
  }
  const add = async (action: string) => {
    const post = await PostModel.findOne({ _id: postId, deleted: false }).select('reactions userReactions')
    if (!post) {
      return next(new AppError(`No post found with ID: ${postId}`, 400))
    }
    const exitsUser = post.userReactions.some((reaction) => String(reaction.userId) === id)
    if (!exitsUser) {
      const data = {
        userId: id,
        reactions: action,
        reactionAt: Date.now()
      }
      const updatePost = await PostModel.findByIdAndUpdate(
        post._id,
        {
          $inc: { [`reactions.${action}`]: 1 },
          $push: { userReactions: data }
        },
        { new: true }
      )
      if (!updatePost) {
        return next(new AppError(`Could not ${action} this post`, 400))
      }
      return updatePost
    }
    return null
  }
  const remove = async (action: string) => {
    const post = await PostModel.findOne({ _id: postId, deleted: false }).select('reactions userReactions')
    if (!post) {
      return next(new AppError(`No post found with ID: ${postId}`, 400))
    }
    const exitsUser = post.userReactions.some(
      (reaction) => String(reaction.userId) === id && reaction.reactions === action
    )
    if (exitsUser) {
      const updatePost = await PostModel.findByIdAndUpdate(
        post._id,
        {
          $inc: { [`reactions.${action}`]: -1 },
          $pull: { userReactions: { userId: id, reactions: action } }
        },
        {
          new: true
        }
      )
      if (!updatePost) {
        return next(new AppError(`Could not ${action} post: ${postId}`, 400))
      }
      return updatePost
    }
    return null
  }
  if (reactionsAdd.includes(action)) {
    const postAfterReaction = await add(action)
    if (postAfterReaction) {
      res.status(200).json({
        status: 'success',
        data: { post: postAfterReaction }
      })
    }
    return next(new AppError(`Could not reaction post: ${postId}`, 400))
  }
  if (reactionsRemove.includes(action)) {
    const postAfterUnReaction = await remove(action.slice(2))
    if (postAfterUnReaction) {
      res.status(200).json({
        status: 'success',
        data: { post: postAfterUnReaction }
      })
    }
    return next(new AppError(`Could not remove reaction post: ${postId}`, 400))
  }
})
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
