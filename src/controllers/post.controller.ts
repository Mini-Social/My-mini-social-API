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
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
