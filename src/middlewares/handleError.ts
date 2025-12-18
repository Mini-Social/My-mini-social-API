import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
export default function HandleError(err: IAppError, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    const errors = err.issues[0].message
    return res.status(400).json({
      status: 'fail',
      message: errors
    })
  }

  return res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error'
  })
}
