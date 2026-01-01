import mongoose from 'mongoose'

interface IMessage extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  content: string
  readBy: mongoose.Types.ObjectId[]
  images: string[]
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    images: [{ type: String }]
  },
  { timestamps: true }
)
MessageSchema.index({ conversationId: 1, createdAt: -1 })
const MessageModel = mongoose.model('Message', MessageSchema, 'Message')
export default MessageModel
