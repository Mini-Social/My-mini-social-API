import { Request, Response, NextFunction } from 'express'
export default function AsyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
