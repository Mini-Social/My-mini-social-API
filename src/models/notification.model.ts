import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    type: String,
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
)
const NotificationModel = mongoose.model('Notification', NotificationSchema, 'Notification')
export default NotificationModel
