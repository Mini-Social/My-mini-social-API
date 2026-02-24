import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import UserModel from '@/models/user.model'
import FriendRequestModel from '@/models/friendrequest.model'
import mongoose from 'mongoose'
export const SendFriendRequest = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const receiverId = req.params.id
  const senderId = res.locals.user.id

  const idValid = CheckInvalidId(receiverId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const receiver = await UserModel.findById(receiverId).select('friends')
  if (!receiver) {
    return next(new AppError('The user does not exist.', 404))
  }
  if (receiverId === senderId) {
    return next(new AppError('Do not send youself friend requests', 400))
  }
  const existRequest = await FriendRequestModel.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId }
    ],
    status: 'pending'
  })
  if (existRequest) {
    return next(new AppError('Can not send a friend request twice.', 400))
  }
  const isFriend = receiver.friends.includes(senderId)
  if (isFriend) {
    return next(new AppError('You are already friends with this user.', 400))
  }
  const body = {
    sender: senderId,
    receiver: receiverId,
    status: 'pending'
  }
  const newRequest = await FriendRequestModel.create(body)
  if (!newRequest) {
    return next(new AppError('Could not send request.', 400))
  }
  res.status(200).json({
    status: 'success',
    data: newRequest
  })
})

export const AcceptFriendRequest = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params
  const { id: myId } = res.locals.user
  const idValid = CheckInvalidId(requestId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const friendRequest = await FriendRequestModel.findOne({ _id: requestId, receiver: myId, status: 'pending' })
  if (!friendRequest) {
    return next(new AppError('The request does not exist.', 404))
  }
  await UserModel.findByIdAndUpdate(myId, {
    $addToSet: { friends: friendRequest.sender }
  })
  await UserModel.findByIdAndUpdate(friendRequest.sender, {
    $addToSet: { friends: myId }
  })
  friendRequest.status = 'accepted'
  await friendRequest.save()

  res.status(200).json({
    status: 'success',
    message: 'Successfully made friends.'
  })
})
export const RefusedFriendRequest = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params
  const { id: myId } = res.locals.user
  const idValid = CheckInvalidId(requestId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const friendRequest = await FriendRequestModel.findByIdAndDelete({
    _id: requestId,
    receiver: myId,
    status: 'pending'
  })
  if (!friendRequest) {
    return next(new AppError('The request does not exist.', 404))
  }
  res.status(200).json({
    status: 'success',
    message: 'Successfully refused.'
  })
})
export const getFriendRequests = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user.id
  const requests = await FriendRequestModel.find({
    receiver: userId,
    status: 'pending'
  })
    .populate({
      path: 'sender',
      select: 'firstName lastName avatar address'
    })
    .sort({ createdAt: -1 })
  res.status(200).json({
    success: true,
    data: requests
  })
})
export const getSentFriendRequests = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user.id
  const requests = await FriendRequestModel.find({
    sender: userId,
    status: 'pending'
  })
    .populate({
      path: 'receiver',
      select: 'firstName lastName avatar address'
    })
    .sort({ createdAt: -1 })
  res.status(200).json({
    success: true,
    data: requests
  })
})
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
