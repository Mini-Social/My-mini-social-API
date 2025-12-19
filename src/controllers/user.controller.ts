import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '../utils/AsyncHandler'
import UserModel from '@/models/user.model'
import { userSchema } from '@/validate/validate'
import bcrypt from 'bcrypt'
import AppError from '@/utils/AppError'
import mongoose from 'mongoose'
export const getAllUsers = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const users = await UserModel.find({ deleted: false })
  res.status(200).json({ message: 'Users retrieved successfully', length: users.length, data: users })
})
export const getUserById = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const isInvalidId = mongoose.Types.ObjectId.isValid(id)
  if (!isInvalidId) {
    return next(new AppError('Invalid user ID', 400))
  }
  const user = await UserModel.findOne({ _id: id, deleted: false })
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.status(200).json({ message: 'User found', data: user })
})
export const getUserByEmail = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.params
  console.log(email)
  const user = await UserModel.findOne({ email, deleted: false })
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.status(200).json({ message: 'User found', data: user })
})
export const getUserByUserName = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userName } = req.params
  const user = await UserModel.findOne({ userName, deleted: false })
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.status(200).json({ message: 'User found', data: user })
})
export const createUser = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const body = userSchema.parse(req.body)
  const existEmailUser = await UserModel.findOne({ email: body.email })
  const existUsernameUser = await UserModel.findOne({ userName: body.userName })
  if (existUsernameUser) {
    return next(new AppError('Username already in use', 400))
  }
  if (existEmailUser) {
    return next(new AppError('Email already in use', 400))
  }
  const user = new UserModel(body)
  const newUser = await user.save()
  if (!newUser) {
    return next(new AppError('Could not create user. Please try again.', 400))
  }
  res.status(200).json({ message: 'Created successfully', data: newUser })
})
export const updateUserById = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const isInvalidId = mongoose.Types.ObjectId.isValid(id)
  if (!isInvalidId) {
    return next(new AppError('Invalid user ID', 400))
  }
  const body = userSchema.partial().parse(req.body)
  if (body.password !== body.passwordConfirm) {
    return next(new AppError('Password and Confirm Password do not match', 400))
  }
  const existEmailUser = await UserModel.findOne({ email: body.email })
  const existUsernameUser = await UserModel.findOne({ userName: body.userName })
  if (existUsernameUser) {
    return next(new AppError('Username already in use', 400))
  }
  if (existEmailUser) {
    return next(new AppError('Email already in use', 400))
  }
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10)
  }
  const newUser = await UserModel.findByIdAndUpdate(id, body, { new: true })
  if (!newUser) {
    return next(new AppError('Not found User', 404))
  }
  res.status(200).json({ message: 'Updated Successfully', data: { user: newUser } })
})
export const deleteUserById = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const isInvalidId = mongoose.Types.ObjectId.isValid(id)
  if (!isInvalidId) {
    return next(new AppError('Invalid user ID', 400))
  }
  const user = await UserModel.findByIdAndUpdate(id, { deleted: true }, { new: true })
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.status(200).json({ message: 'User deleted successfully', data: user })
})
