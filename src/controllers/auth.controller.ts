import jwt from 'jsonwebtoken'
import { env } from '@/constants/enviroments'
import bcrypt from 'bcrypt'
import AsyncHandler from '@/utils/AsyncHandler'
import { Request, Response, NextFunction } from 'express'
import { loginSchema, userSchema } from '@/validate/validate'
import UserModel, { IUser } from '@/models/user.model'
import AppError from '@/utils/AppError'
import mongoose from 'mongoose'
export const SignIn = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = loginSchema.parse(req.body)
  const user = await UserModel.findOne({ email })
  if (!user) {
    return next(new AppError('Invalid email. Please try again.', 401))
  }
  const isMatch = await bcrypt.compare(password as string, user.password as string)
  if (!isMatch) {
    return next(new AppError('Invalid password. Please try again.', 401))
  }
  user.isOnline = true
  SendResponeWithToken(req, res, user, 200)
})
export const SignUp = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const body = userSchema.parse(req.body)

  const existEmail = await UserModel.findOne({ email: body.email })
  const existUser = await UserModel.findOne({ userName: body.userName })
  if (existEmail) {
    return next(new AppError('Email already exists. Please use a diffirent email address', 400))
  }
  if (existUser) {
    return next(new AppError('User already exists. Please use a diffirent username', 400))
  }
  const user = new UserModel(body)
  const newUser = await user.save()
  if (!newUser) {
    return next(new AppError('Could not create user. Please try again.', 400))
  }
  SendResponeWithToken(req, res, newUser, 200)
})
function SignToken(id: mongoose.Types.ObjectId, role: string): string {
  const token = jwt.sign({ id, role }, env.JWT_SUPERSECRET as string, {
    expiresIn: Number(env.JWT_COOKIE_EXPIRED_IN) * 24 * 60 * 60 * 1000
  })
  return token
}
function SendResponeWithToken(req: Request, res: Response, user: IUser, statusCode: number) {
  const token = SignToken(user._id, user.role)
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + Number(env.JWT_COOKIE_EXPIRED_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true
  })
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
      token
    }
  })
}
