import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import ConversationModel from '@/models/conversation.model'
import mongoose from 'mongoose'
import UserModel from '@/models/user.model'
import { conversationSchema } from '@/validate/validate'
import { upload } from '@/services/multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { CleanImages } from '@/utils/CleanImages'
export const CreatePrivateChat = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(userId)
  if (!idValid) {
    return next(new AppError('Invalid ID', 400))
  }
  const existUser = await UserModel.findById(userId).select('firstName lastName')
  if (!existUser) {
    return next(new AppError(`Could not found user with iD: ${userId}`, 404))
  }
  const existConversation = await ConversationModel.findOne({
    members: { $all: [id, userId] },
    type: 'private'
  }).populate('members', 'firstName lastName avatar isOnline')
  if (existConversation) {
    res.status(200).json({
      status: 'success',
      data: { conversation: existConversation }
    })
    return
  }
  const data = {
    members: [id, userId],
    type: 'private',
    groupName: `${existUser.firstName} ${existUser.lastName}`
  }
  const newConversation = await ConversationModel.create(data)
  if (!newConversation) {
    return next(new AppError('Could not create new conversation', 400))
  }
  const fullConversation = await ConversationModel.findById(newConversation._id).populate(
    'members',
    'firstName lastName avatar isOnline'
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
    groupAdmin: [myId],
    lastMessage: 'Đã tạo nhóm'
  }

  const newConversation = await ConversationModel.create(data)
  if (!newConversation) {
    return next(new AppError('Could not create new conversation', 400))
  }
  const fullConversation = await ConversationModel.findById(newConversation._id)
    .populate('members', 'firstName lastName avatar isOnline')
    .populate('groupAdmin', 'firstName lastName avatar isOnline')
  res.status(200).json({
    status: 'success',
    data: { conversation: fullConversation }
  })
})
export const UpdateGroupChat = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const deleteUploadedFile = () => {
    if (req.file) CleanImages([req.body.avatar])
  }
  const { conversationId } = req.params
  const { id } = res.locals.user
  const idValid = CheckInvalidId(conversationId)
  if (!idValid) {
    deleteUploadedFile()
    return next(new AppError('Invalid ID', 400))
  }
  const isAdmin = await ConversationModel.findOne({
    groupAdmin: { $in: id },
    type: 'group'
  })
  if (!isAdmin) {
    deleteUploadedFile()
    return next(new AppError('You are not Admin', 400))
  }
  const body = conversationSchema.parse(req.body)
  const update = await ConversationModel.findByIdAndUpdate(conversationId, body, { new: true })
    .populate('members', 'firstName lastName avatar isOnline')
    .populate('groupAdmin', 'firstName lastName avatar isOnline')
  if (!update) {
    deleteUploadedFile()
    return next(new AppError('Could not update conversation', 400))
  }
  res.status(200).json({
    status: 'success',
    data: { conversation: update }
  })
})
export const ToggleGroupMember = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userIds } = req.body
  const { conversationId, action } = req.params
  const { id } = res.locals.user
  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({ message: 'Invalid members' })
    return
  }
  const convo = await ConversationModel.findById(conversationId)
  if (!convo?.groupAdmin.includes(id)) {
    return next(new AppError('You are not admin in this group', 400))
  }
  let updateQuery = {}
  if (action === 'add') {
    updateQuery = { $addToSet: { members: { $each: userIds } } }
  } else if (action === 'remove') {
    updateQuery = { $pull: { members: { $in: userIds } } }
  } else {
    res.status(400).json({ message: 'Invalid action' })
    return
  }
  const updateConversation = await ConversationModel.findByIdAndUpdate(conversationId, updateQuery, { new: true })
    .populate('members', 'firstName lastName avatar isOnline')
    .populate('groupAdmin', 'firstName lastName avatar isOnline')

  res.status(200).json({
    status: 'success',
    data: { conversation: updateConversation }
  })
})
export const UploadConversationImage = upload.single('avatar')
export const SaveConversationImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next()
  const targetDir = path.join(__dirname, '../../public/img/conversations')
  const conversationId = uuidv4()
  const fileName = `conversationId-${conversationId}-${Date.now()}.jpeg`
  await sharp(req.file.buffer).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`${targetDir}/${fileName}`)
  req.body.avatar = fileName
  next()
}
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
