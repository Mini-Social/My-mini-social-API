import mongoose from 'mongoose'

interface IMessage extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  content: string
  isRead: boolean
  attachments: {
    type: string
    url: string
    fileName: string
    fileSize: number
  }[]
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    attachments: [
      {
        type: { type: String, enum: ['image', 'video', 'audio', 'file'] },
        url: String,
        fileName: String,
        fileSize: Number
      }
    ]
  },
  { timestamps: true }
)
const MessageModel = mongoose.model('Message', MessageSchema, 'Message')
export default MessageModel
