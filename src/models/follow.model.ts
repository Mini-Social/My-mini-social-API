import mongoose from 'mongoose'
const FollowSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
const FollowModel = mongoose.model('Follow', FollowSchema, 'Follow')
export default FollowModel
