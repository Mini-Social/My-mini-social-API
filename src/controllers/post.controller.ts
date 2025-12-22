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
  const deletePost = await PostModel.findByIdAndUpdate(postId, { deleted: true })
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
  const post = await PostModel.findById(postId).select('images author deleted')
  if (!post) {
    return next(new AppError(`Not Found post: ${postId}`, 400))
  }
  if (id !== String(post.author)) {
    return next(new AppError('You do not have permission to restore this post.', 400))
  }
  if (!post.deleted) {
    return next(new AppError('This post is now public.', 400))
  }
  const restorePost = await PostModel.findByIdAndUpdate(postId, { deleted: false }, { new: true })
  if (!restorePost) {
    return next(new AppError(`Could not restore this post: ${postId}`, 400))
  }
  res.status(200).json({
    status: 'success',
    data: { restorePost }
  })
})
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
