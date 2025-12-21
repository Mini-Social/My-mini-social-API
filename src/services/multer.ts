import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'
const storage = multer.memoryStorage()
function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
export const upload = multer({ storage: storage, fileFilter: fileFilter })
