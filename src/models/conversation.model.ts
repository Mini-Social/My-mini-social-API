import mongoose from 'mongoose'
interface IConversation extends mongoose.Document {
  members: mongoose.Types.ObjectId[]
  type: string
  lastMessage: string
}
const ConversationSchema = new mongoose.Schema<IConversation>(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    lastMessage: { type: String, default: '' }
  },
  { timestamps: true }
)
const ConversationModel = mongoose.model('Conversation', ConversationSchema, 'Conversation')
export default ConversationModel
