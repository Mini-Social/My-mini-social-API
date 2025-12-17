import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '../utils/AsyncHandler'
export const testFunction = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.send('test')
})
