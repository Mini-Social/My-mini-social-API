import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import { upload } from '@/services/multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import sharp from 'sharp'
import mongoose from 'mongoose'
import ConversationModel from '@/models/conversation.model'
import MessageModel from '@/models/message.model'
import { messageSchema } from '@/validate/validate'

export const SendPrivateMessage = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId, receiver } = req.body
  const body = messageSchema.parse(req.body)
  const { id: sender } = res.locals.user
  let conversation
  if (conversationId) {
    conversation = await ConversationModel.findById(conversationId)
  }

  if (!conversation) {
    conversation = await ConversationModel.create({
      members: [sender, receiver],
      type: 'private',
      unReadCount: [
        { userId: sender, count: 0 },
        { userId: receiver, count: 0 }
      ]
    })
  }
  const message = await MessageModel.create({
    conversationId: conversation._id,
    sender,
    ...body,
    readBy: [sender]
  })
  let lastMessage = ''
  if (body.content) {
    lastMessage = body.content
  } else if (body.images) {
    lastMessage = `Đã gửi ${body.images.length} ảnh.`
  }
  conversation.lastMessage = lastMessage
  conversation.lastSenderId = sender
  conversation.lastMessageAt = new Date(Date.now())
  conversation.unReadCount = conversation.unReadCount.map((u: any) => {
    const isSender = u.userId.toString() === sender.toString()
    return {
      userId: u.userId,
      count: isSender ? 0 : Number(u.count) + 1
    }
  })
  await conversation.save()
  res.status(200).json({
    status: 'success',
    data: { message }
  })
})

export const SendGroupMessage = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.body
  const body = messageSchema.parse(req.body)
  const { id: sender } = res.locals.user
  const conversation = await ConversationModel.findById(conversationId)
  if (!conversation || conversation.type !== 'group') {
    return next(new AppError('Not found or invalid Conversation', 404))
  }
  if (!conversation.members.includes(sender)) {
    return next(new AppError('You do not have permission to send message in group', 400))
  }
  const message = await MessageModel.create({
    conversationId: conversation._id,
    sender,
    ...body,
    readBy: [sender]
  })
  let lastMessage = ''
  if (body.content) {
    lastMessage = body.content
  } else if (body.images) {
    lastMessage = `Đã gửi ${body.images.length} ảnh.`
  }

  await ConversationModel.updateOne(
    {
      _id: conversation._id
    },
    {
      $set: {
        lastMessage,
        lastSenderId: sender,
        lastMessageAt: Date.now(),
        'unReadCount.$[senderElem].count': 0
      },
      $inc: {
        'unReadCount.$[elem].count': 1
      }
    },
    {
      arrayFilters: [{ 'senderElem.userId': sender }, { 'elem.userId': { $ne: sender } }]
    }
  )
  res.status(200).json({
    status: 'success',
    data: { message }
  })
})
export const UploadMessageImage = upload.array('images', 6)
export const SaveMessageImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) return next()
  const targetDir = path.join(__dirname, '../assest/img/messages')
  const messageId = uuidv4()
  const promiseFiles = (req.files as Express.Multer.File[]).map(async (file, index) => {
    const fileName = `messageId-${messageId}-${Date.now()}-${index + 1}.jpeg`
    await sharp(file.buffer).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`${targetDir}/${fileName}`)
    return fileName
  })
  req.body.images = await Promise.all(promiseFiles)
  next()
}
function CheckInvalidId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}
