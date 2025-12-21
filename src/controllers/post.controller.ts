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
    if (req.body.images && req.body.images.length > 0) {
      req.body.images.forEach((image: string) => {
        const filePath = path.join(__dirname, '../../public/img/posts', image)
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log('Could not remove junk files')
          } else {
            console.log(`Cleaned: ${image}`)
          }
        })
      })
    }
    return next(new AppError(error.message, 400))
  }
})
