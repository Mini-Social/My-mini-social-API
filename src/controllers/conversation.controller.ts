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
import MessageModel from '@/models/message.model'
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
    unReadCount: [
      { userId: id, unReadCount: 0 },
      { userId, unReadCount: 0 }
    ]
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
  const unReadCount = uniqueMembers.map((m) => {
    return {
      userId: m,
      unReadCount: 0
    }
  })
  const data = {
    members: uniqueMembers,
    type: 'group',
    groupName: groupName || newGroupName,
    groupAdmin: [myId],
    lastMessage: 'Đã tạo nhóm',
    unReadCount
  }

  const newConversation = await ConversationModel.create(data)
  if (!newConversation) {
    return next(new AppError('Could not create new conversation', 400))
  }
  const fullConversation = await ConversationModel.findById(newConversation._id)
    .populate('members', '_id userName firstName lastName avatar isOnline')
    .populate('groupAdmin', '_id userName firstName lastName avatar isOnline')
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
    _id: conversationId,
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
  if (!convo?.members.includes(id)) {
    return next(new AppError('You are not members in this group', 400))
  }
  if (!convo?.groupAdmin.includes(id)) {
    return next(new AppError('You are not admin in this group', 400))
  }
  if (userIds.includes(id)) {
    return next(new AppError('Cound not add youselft', 400))
  }
  for (const id of userIds) {
    if (convo.members.includes(id)) {
      return next(new AppError(`Id: ${id} already is member in group.`, 400))
    }
  }
  let updateQuery = {}
  if (action === 'add') {
    const unReadCounts = userIds.map((u) => ({
      userId: u,
      count: 0
    }))
    await ConversationModel.findByIdAndUpdate(conversationId, {
      $addToSet: { members: { $each: userIds } },
      $push: { unReadCount: unReadCounts }
    })
  } else if (action === 'remove') {
    const isAllMembers = userIds.every((id) => convo.members.includes(id))
    if (!isAllMembers) {
      return next(new AppError('Only group members can remove.', 400))
    }
    if (userIds.includes(id)) {
      return next(new AppError('Could not remove yourself.', 400))
    }
    await ConversationModel.findByIdAndUpdate(conversationId, {
      $pull: { unReadCount: { userId: { $in: userIds } }, members: { $in: userIds } }
    })
  } else if (action === 'makeAdmin') {
    const isAllMembers = userIds.every((id) => convo.members.includes(id))
    if (!isAllMembers) {
      return next(new AppError('Only group members can be admins.', 400))
    }
    if (userIds.includes(id)) {
      return next(new AppError('Could not makeAdmin yourself.', 400))
    }
    updateQuery = { $addToSet: { groupAdmin: { $each: userIds } } }
  } else if (action === 'removeAdmin') {
    if (userIds.includes(id)) {
      return next(new AppError('Could not remove admin yourseft', 400))
    }
    const remainingAdmin = convo.groupAdmin.filter((id) => !userIds.includes(id.toString()))
    if (remainingAdmin.length === 0) {
      return next(new AppError('The group must have at least 1 admin.', 400))
    }
    const isAllAdmins = userIds.every((id) => convo.groupAdmin.includes(id))
    if (!isAllAdmins) {
      return next(new AppError('Only group admins can remove.', 400))
    }
    updateQuery = { $pull: { groupAdmin: { $in: userIds } } }
  } else {
    res.status(400).json({ message: 'Invalid action' })
    return
  }
  const myName = res.locals.info.lastName
  const affectedUsers = await UserModel.find({ _id: { $in: userIds } }).select('lastName')
  const affectedNames =
    affectedUsers.length > 2
      ? `${affectedUsers[0].lastName} và ${affectedUsers.length - 1} người khác`
      : affectedUsers.map((u) => `${u.lastName}`).join(', ')
  let systemText = ''
  if (action === 'add') systemText = `${myName} đã thêm ${affectedNames} vào nhóm.`
  else if (action === 'remove') systemText = `${myName} đã xóa ${affectedNames} khỏi nhóm`
  else if (action === 'makeAdmin') systemText = `${myName} đã bổ nhiệm ${affectedNames} làm quản trị viên`
  else if (action === 'removeAdmin') systemText = `${myName} đã gỡ quyền quản trị viên của ${affectedNames}`

  const receivers = convo.members.concat(userIds).filter((memberId) => memberId.toString() !== id.toString())
  const updateConversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      ...updateQuery,
      lastMessage: systemText,
      lastSenderId: null,
      lastMessageAt: Date.now(),
      $set: {
        'unReadCount.$[senderElem].count': 0
      },
      $inc: {
        'unReadCount.$[elem].count': 1
      }
    },
    { new: true, arrayFilters: [{ 'elem.userId': { $in: receivers } }, { 'senderElem.userId': id }] }
  )
    .populate('members', 'firstName lastName avatar isOnline')
    .populate('groupAdmin', 'firstName lastName avatar isOnline')

  res.status(200).json({
    status: 'success',
    data: { conversation: updateConversation }
  })
})
export const GetConversation = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id: myId } = res.locals.user
  const page = Number(req.query.page) | 1
  const limit = Number(req.query.limit) | 15
  const conversations = await ConversationModel.find({
    members: { $in: myId }
  })
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('members', '_id userName firstName lastName avatar isOnline')
    .populate('groupAdmin', '_id userName firstName lastName avatar isOnline')
    .populate('lastSenderId', '_id userName firstName lastName avatar')
  res.status(200).json({
    status: 'success',
    length: conversations.length,
    data: { conversations }
  })
})
export const LeaveGroup = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params
  const { id: myId } = res.locals.user
  const { lastName } = res.locals.info
  const convo = await ConversationModel.findById(conversationId)
  if (!convo) {
    return next(new AppError('Group not found', 404))
  }
  if (!convo.members.includes(myId)) {
    return next(new AppError('You are not member in this group', 400))
  }
  const isAdmin = convo.groupAdmin.includes(myId)
  if (isAdmin && convo.groupAdmin.length === 1 && convo.members.length > 1) {
    return next(new AppError('You are the last admin. Please appoint another before leaving.', 400))
  }
  const unReadCounts = convo.members.filter((id) => id !== myId)
  await ConversationModel.findByIdAndUpdate(conversationId, {
    $pull: {
      members: myId,
      groupAdmin: myId,
      unReadCount: { userId: myId }
    }
  })
  const updatedConvo = await ConversationModel.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        lastMessage: `${lastName} đã rời khỏi nhóm.`,
        lastMessageAt: Date.now(),
        lastSenderId: null
      },
      $inc: { 'unReadCount.$[elem].count': 1 }
    },
    {
      new: true,
      arrayFilters: [{ 'elem.userId': { $in: unReadCounts } }]
    }
  )

  if (updatedConvo && updatedConvo.members.length === 0) {
    await ConversationModel.findByIdAndDelete(conversationId)
    res.status(200).json({
      status: 'success',
      message: 'Group Delete'
    })
    return
  }
  res.status(200).json({
    status: 'success',
    data: { conversation: updatedConvo }
  })
})
export const DeleteGroup = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params
  const { id: myId } = res.locals.user
  const convo = await ConversationModel.findById(conversationId)
  if (!convo) {
    return next(new AppError('Group not found', 404))
  }
  if (convo.groupAdmin[0].toString() !== myId) {
    return next(new AppError('Only the main admin can dissolve the group', 400))
  }
  await ConversationModel.findByIdAndDelete(conversationId)
  await MessageModel.deleteMany({ conversationId })
  res.status(200).json({
    status: 'success',
    message: 'Group and messages deleted'
  })
})
export const GetMessage = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params
  const limit = parseInt(req.query.limit as string) || 10
  const cursor = req.query.cursor as string

  const query: any = { conversationId }
  if (cursor) {
    query.createdAt = { $lte: new Date(cursor) }
  }
  let messages = await MessageModel.find(query)
    .sort({ createdAt: -1 })
    // .limit(limit + 1)
    .populate('sender', '_id firstname lastname avatar')
    .populate('readBy', '_id firstName lastName avatar')
  let nextCursor = null

  if (messages.length > limit) {
    const nextMessage = messages[messages.length - 1]
    nextCursor = nextMessage.createdAt.toISOString()
    messages.pop()
  }
  const conversation = await ConversationModel.findOne({ _id: conversationId })
    .populate({
      path: 'members',
      select: '_id userName firstName lastName avatar isOnline lastOnline'
    })
    .populate({
      path: 'groupAdmin',
      select: '_id userName firstName lastName avatar isOnline lastOnline'
    })
    .populate({
      path: 'lastSenderId',
      select: '_id userName firstName lastName avatar'
    })
    .lean()

  messages = messages.reverse()
  res.status(200).json({
    status: 'success',
    nextCursor,
    messages,
    conversation
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
