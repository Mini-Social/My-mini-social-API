import mongoose from 'mongoose'
interface IFriendRequest extends mongoose.Document {
  sender: mongoose.Types.ObjectId
  receiver: mongoose.Types.ObjectId
  status: string
}
const FriendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'refused'], default: 'pending' }
  },
  {
    timestamps: true
  }
)
const FriendRequestModel = mongoose.model('FriendRequest', FriendRequestSchema, 'FriendRequest')
export default FriendRequestModel
