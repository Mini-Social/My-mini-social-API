import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'

export const HandleNotFound = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`The path: ${req.originalUrl} could not be found.`, 404))
})
