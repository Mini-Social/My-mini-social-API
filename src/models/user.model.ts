import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    avatar: String,
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female'] },
    phone: { type: String, default: '' },
    birthDate: { type: Date, default: null },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isOnline: { type: Boolean, default: false },
    lastOnline: { type: Date, default: null },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)
const UserModel = mongoose.model('User', userSchema, 'User')
export default UserModel
