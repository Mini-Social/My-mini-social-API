import { Request, Response, NextFunction } from 'express'
export default function HandleError(err: IAppError, req: Request, res: Response, next: NextFunction) {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error'
  })
}
