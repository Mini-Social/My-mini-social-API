import mongoose from 'mongoose'

interface IPost extends mongoose.Document {
  author: mongoose.Types.ObjectId
  content: string
  images: string[]
  reactions: {
    like: number
    love: number
    haha: number
    wow: number
    sad: number
    angry: number
  }
  userReactions: {
    userId: mongoose.Types.ObjectId
    reactions: string
    reactionAt: Date
  }
  visibility: string
  shares: {
    userId: mongoose.Types.ObjectId
    sharedAt: Date
  }
  sharePostId: mongoose.Types.ObjectId | null
}
const PostSchema = new mongoose.Schema<IPost>(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    images: Array<string>,
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
    },
    visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
    shares: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sharedAt: { type: Date, default: Date.now }
    },
    sharePostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }
  },
  {
    timestamps: true
  }
)

const PostModel = mongoose.model('Post', PostSchema, 'Post')
export default PostModel
