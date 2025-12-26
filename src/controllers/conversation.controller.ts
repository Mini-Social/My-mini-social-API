import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import ConversationModel from '@/models/conversation.model'
import mongoose from 'mongoose'
import UserModel, { IUser } from '@/models/user.model'

export const CreatePrivateChat = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(userId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const existConversation = await ConversationModel.findOne({
    members: { $all: [id, userId] },
    type: 'private'
  }).populate('members', 'name avatar isOnline')
  if (existConversation) {
    res.status(200).json({
      status: 'success',
      data: { conversation: existConversation }
    })
    return
  }
  const data = {
    members: [id, userId],
    type: 'private'
  }
  const newConversation = await ConversationModel.create(data)
  if (!newConversation) {
    return next(new AppError('Could not create new conversation', 400))
  }
  const fullConversation = await ConversationModel.findById(newConversation._id).populate(
    'members',
    'name avatar isOnline'
  )
  res.status(200).json({
    status: 'success',
    data: { conversation: fullConversation }
  })
})
export const CreateGroupChat = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { members, groupName } = req.body
  const { id: myId } = res.locals.user
  const newMembers = [...members, myId]
  const idValid = newMembers.some((member: any) => CheckInvalidId(member))
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const uniqueMembers = [...new Set(newMembers)]
  const count = uniqueMembers.length
  console.log(newMembers)
  if (count < 3) {
    return next(new AppError('Not enough people to create a new group.', 400))
  }
  let newGroupName = ''
  if (!groupName) {
    const users = await UserModel.find({ _id: { $in: uniqueMembers } }).select('firstName lastName')
    newGroupName = users.map((user) => user.lastName).join(', ')
  }
  const data = {
    members: uniqueMembers,
    type: 'group',
    groupName: groupName || newGroupName,
    groupAdmin: myId,
    lastMessage: 'Bạn đã tạo nhóm này.'
  }
  const newConversation = await ConversationModel.create(data)
  if (!newConversation) {
    return next(new AppError('Could not create new conversation', 400))
  }
  res.status(200).json({
    status: 'success',
    data: { conversation: newConversation }
  })
})
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
