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
  const user = await UserModel.findOne({ email, deleted: false })
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.status(200).json({ message: 'User found', data: user })
})
export const getUserByUserName = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userName } = req.params
  const user = await UserModel.findOne({ userName, deleted: false }).populate(
    'friends',
    '_id userName firstName lastName avatar'
  )
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
  const existUsernameUser = await UserModel.findOne({ userName: body.userName })
  if (existUsernameUser) {
    return next(new AppError('Username already in use', 400))
  }
  const existEmailUser = await UserModel.findOne({ email: body.email })
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
export const getSuggestions = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  const info = res.locals.info
  console.log(user)
  const myId = new mongoose.Types.ObjectId(user._id || user.id)
  const suggestions = await UserModel.aggregate([
    // 1. Loại bỏ bản thân, bạn bè hiện tại và tài khoản đã bị xóa (deleted)
    {
      $match: {
        _id: { $ne: myId, $nin: info.friends },
        deleted: false
      }
    },

    // 2. Tính toán điểm ưu tiên (Scoring)
    {
      $addFields: {
        score: {
          $add: [
            // Ưu tiên người cùng địa chỉ (cộng 10 điểm)
            { $cond: [{ $eq: ['$address', info.address] }, 10, 0] },
            // Ưu tiên người đang Online (cộng 5 điểm)
            { $cond: [{ $eq: ['$isOnline', true] }, 5, 0] },
            // Ưu tiên người có bạn chung (mỗi bạn chung cộng 2 điểm)
            { $multiply: [{ $size: { $setIntersection: ['$friends', info.friends] } }, 2] }
          ]
        },
        // Tính số lượng bạn chung để hiển thị lên UI
        mutualFriendsCount: { $size: { $setIntersection: ['$friends', info.friends] } }
      }
    },

    // 3. Sắp xếp theo điểm ưu tiên cao nhất
    { $sort: { score: -1, createdAt: -1 } },

    // 4. Giới hạn 10 người
    { $limit: 10 },

    // 5. Chỉ lấy các field cần thiết cho UI
    {
      $project: {
        firstName: 1,
        lastName: 1,
        userName: 1,
        avatar: 1,
        address: 1,
        isOnline: 1,
        mutualFriendsCount: 1
      }
    }
  ])
  res.status(200).json({ data: suggestions })
})
export const getFriendsList = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id
    if (!userId) {
      return res.status(400).json({ message: 'Không tìm thấy ID người dùng' })
    }
    const user = await UserModel.findById(userId)
      .populate({
        path: 'friends',
        select: '_id firstName lastName userName avatar isOnline'
      })
      .lean()

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' })
    }
    return res.status(200).json({
      success: true,
      data: user.friends
    })
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error })
  }
}
