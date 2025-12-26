import { Request, Response, NextFunction } from 'express'
import AsyncHandler from '@/utils/AsyncHandler'
import AppError from '@/utils/AppError'
import ConversationModel from '@/models/conversation.model'

export const CreatePrivateChat = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params
  const { id } = res.locals.user

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
