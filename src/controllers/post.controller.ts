import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import { upload } from '@/services/multer'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
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
