import mongoose from 'mongoose'
interface IConversation extends mongoose.Document {
  members: mongoose.Types.ObjectId[]
  type: string
  groupName: string | null
  avatar: string
  groupAdmin: mongoose.Types.ObjectId[]
  lastMessage: string
  lastMessageAt: Date
}
const ConversationSchema = new mongoose.Schema<IConversation>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    groupName: { type: String, default: null },
    avatar: String,
    groupAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
ConversationSchema.index({ members: 1 })
const ConversationModel = mongoose.model('Conversation', ConversationSchema, 'Conversation')
export default ConversationModel
