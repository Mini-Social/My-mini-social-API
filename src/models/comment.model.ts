import mongoose from 'mongoose'

interface IComment extends mongoose.Document {
  postId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  content: string
  image: string | null
  parentCommentId: mongoose.Types.ObjectId | null
  reactions: {
    like: number
    love: number
    haha: number
    wow: number
    sad: number
    angry: number
  }
  userReactions: [
    {
      userId: mongoose.Types.ObjectId
      reactions: string
      reactionAt: Date
    }
  ]
}
const CommentSchema = new mongoose.Schema<IComment>(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String, default: null },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 }
    },
    userReactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reactions: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'] },
        reactionAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
)
const CommentModel = mongoose.model('Comment', CommentSchema, 'Comment')
export default CommentModel
