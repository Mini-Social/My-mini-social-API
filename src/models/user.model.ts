import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'
export interface IUser extends Document {
  firstName: string
  lastName: string
  userName: string
  email: string
  password: string | undefined
  avatar: string
  bio: string
  gender: string
  phone: string
  birthDate: Date
  role: string
  friends: mongoose.Types.ObjectId[]
  isOnline: boolean
  lastOnline: Date
  deleted: boolean
  comparePassword(candicatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
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
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isOnline: { type: Boolean, default: false },
    lastOnline: { type: Date, default: null },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)
UserSchema.pre('save' as any, async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password as string, 10)
  }
})
UserSchema.methods.comparePassword = async function (candicatePassword: string): Promise<boolean> {
  return bcrypt.compare(this.password, candicatePassword)
}
const UserModel = mongoose.model('User', UserSchema, 'User')
export default UserModel
