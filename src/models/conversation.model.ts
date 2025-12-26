import mongoose from 'mongoose'
interface IConversation extends mongoose.Document {
  members: mongoose.Types.ObjectId[]
  type: string
  groupName: string
  groupAvatar: string
  groupAdmin: mongoose.Types.ObjectId
  lastMessage: string
  lastMessageAt: Date
}
const ConversationSchema = new mongoose.Schema<IConversation>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    groupName: String,
    groupAvatar: String,
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
ConversationSchema.index({ members: 1 })
const ConversationModel = mongoose.model('Conversation', ConversationSchema, 'Conversation')
export default ConversationModel
