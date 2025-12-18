import mongoose from 'mongoose'
const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: String,
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 }
    },
    userReactions: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reactions: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'] },
      reactionAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
)
const CommentModel = mongoose.model('Comment', CommentSchema, 'Comment')
export default CommentModel
