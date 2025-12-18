import mongoose from 'mongoose'
const FriendRequestSchema = new mongoose.Schema(
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
