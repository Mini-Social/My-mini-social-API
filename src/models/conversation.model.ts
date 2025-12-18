import mongoose from 'mongoose'

const ConversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    lastMessage: { type: String, default: '' }
  },
  { timestamps: true }
)
const ConversationModel = mongoose.model('Conversation', ConversationSchema, 'Conversation')
export default ConversationModel
