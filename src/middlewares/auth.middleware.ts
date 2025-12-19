import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import AppError from '@/utils/AppError'
import { env } from '@/constants/enviroments'
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    return next(new AppError('No token or Invalid Token', 400))
  }
  const decoded = await jwt.verify(token, env.JWT_SUPERSECRET)
  if (!decoded) {
    return next(new AppError('Invalid Token', 400))
  }
  res.locals.user = decoded as { id: string; role: string }
  next()
}
