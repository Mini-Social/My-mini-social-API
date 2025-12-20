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
  const user = await UserModel.findOne({ email, deleted: false })
  if (!user) {
    return next(new AppError('Invalid email. Please try again.', 401))
  }
  const isMatch = await bcrypt.compare(password as string, user.password as string)
  if (!isMatch) {
    return next(new AppError('Invalid password. Please try again.', 401))
  }
  const update = await UserModel.findByIdAndUpdate(user._id, { isOnline: true, lastOnline: null })
  if (!update) {
    return next(new AppError('Could not update', 401))
  }
  SendResponeWithToken(req, res, user, 200)
})
export const SignUp = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const body = userSchema.parse(req.body)

  const existEmail = await UserModel.findOne({ email: body.email, deleted: false })
  if (existEmail) {
    return next(new AppError('Email already exists. Please use a diffirent email address', 400))
  }
  const existUser = await UserModel.findOne({ userName: body.userName, deleted: false })
  if (existUser) {
    return next(new AppError('User already exists. Please use a diffirent username', 400))
  }
  const user = new UserModel(body)
  user.isOnline = true
  const newUser = await user.save()
  if (!newUser) {
    return next(new AppError('Could not create user. Please try again.', 400))
  }
  SendResponeWithToken(req, res, newUser, 200)
})
export const Logout = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const update = await UserModel.findByIdAndUpdate(id, { isOnline: false, lastOnline: Date.now() })
  if (!update) {
    return next(new AppError('Could not update', 401))
  }
  res.clearCookie('jwt')
  res.status(200).json({ message: 'Logout successfully' })
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
export const UpdatePassword = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { password } = userSchema.partial().parse(req.body)
  const { id } = res.locals.user
  const { oldPassword } = req.body
  const existUser = await UserModel.findById(id)
  const user = await UserModel.findOne({ email: existUser?.email, deleted: false })
  if (!existUser || !user) {
    return next(new AppError('Not Found User', 404))
  }
  const isMatch = await bcrypt.compare(oldPassword as string, user?.password as string)
  if (!oldPassword || oldPassword.length <= 5 || !isMatch) {
    return next(new AppError('Invalid password', 400))
  }
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Update password successfully.' })
})
export const UpdateProfile = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  delete req.body.password
  const body = userSchema.partial().parse(req.body)
  const { id } = res.locals.user
  const existEmail = await UserModel.findOne({ email: body.email, deleted: false })
  if (existEmail) {
    return next(new AppError('Email already in use. Please use a different email address.', 400))
  }
  const existUsername = await UserModel.findOne({ userName: body.userName, deleted: false })
  if (existUsername) {
    return next(new AppError('Username already in use. Please use a different username.', 400))
  }
  const updateMe = await UserModel.findByIdAndUpdate(id, body, { new: true }).select('-password')
  if (!updateMe) {
    return next(new AppError('Could not update user.', 400))
  }
  res.status(200).json({
    status: 'success',
    data: updateMe
  })
})
export const GetProfile = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = res.locals.user
  const user = await UserModel.findById(id).select('-password')
  if (!user) {
    return next(new AppError('Not Found User', 404))
  }
  res.status(200).json({
    status: 'success',
    data: user
  })
})
