import mongoose from 'mongoose'
import { env } from '../constants/enviroments'
import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1'])
// MongoDB connection
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}
