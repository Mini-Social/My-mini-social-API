import mongoose from 'mongoose'

interface IUnReadCount {
  userId: mongoose.Types.ObjectId
  count: number
}

interface IConversation extends mongoose.Document {
  members: mongoose.Types.ObjectId[]
  type: string
  groupName: string | null
  avatar: string
  groupAdmin: mongoose.Types.ObjectId[]
  lastMessage: string
  lastSenderId: mongoose.Types.ObjectId | null
  lastMessageAt: Date
  unReadCount: IUnReadCount[]
}
const ConversationSchema = new mongoose.Schema<IConversation>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    groupName: { type: String, default: null },
    avatar: String,
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: '' },
    lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessageAt: { type: Date, default: Date.now },
    unReadCount: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
)
ConversationSchema.index({ members: 1, lastMessageAt: -1 })
const ConversationModel = mongoose.model('Conversation', ConversationSchema, 'Conversation')
export default ConversationModel
