import mongoose from 'mongoose'
interface IFollow extends mongoose.Document {
  follower: mongoose.Types.ObjectId
  following: mongoose.Types.ObjectId
  createdAt: Date
}
const FollowSchema = new mongoose.Schema<IFollow>(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
const FollowModel = mongoose.model('Follow', FollowSchema, 'Follow')
export default FollowModel
