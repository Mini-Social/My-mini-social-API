// import 'dotenv/config'
// import mongoose from 'mongoose'
// import bcrypt from 'bcrypt'
// import UserModel from './models/user.model'
// import PostModel from './models/post.model'

// const TOTAL_USERS = 50
// const TOTAL_POSTS = 150
// const SALT_ROUNDS = 10

// const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const

// const userIds = Array.from({ length: TOTAL_USERS }, () => new mongoose.Types.ObjectId())

// const randomFromArray = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

// const generateUsers = async () => {
//   const users: any[] = []

//   for (let i = 0; i < TOTAL_USERS; i++) {
//     const hashedPassword = await bcrypt.hash('123456', SALT_ROUNDS)

//     const friends = userIds
//       .filter((_, idx) => idx !== i)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, Math.floor(Math.random() * 4) + 2)

//     users.push({
//       _id: userIds[i],
//       firstName: `User${i + 1}`,
//       lastName: 'Demo',
//       userName: `user${i + 1}`,
//       email: `user${i + 1}@gmail.com`,
//       password: hashedPassword,
//       avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
//       bio: 'Seed user',
//       gender: i % 2 === 0 ? 'Male' : 'Female',
//       phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
//       birthDate: new Date(1995 + (i % 8), i % 12, (i % 28) + 1),
//       role: i === 0 ? 'Admin' : 'User',
//       friends,
//       isOnline: false,
//       lastOnline: new Date(),
//       deleted: false
//     })
//   }

//   return users
// }

// const generatePosts = () => {
//   const posts: any[] = []

//   for (let i = 0; i < TOTAL_POSTS; i++) {
//     const author = randomFromArray(userIds)

//     const reactionCount = Math.floor(Math.random() * 8)
//     const usedUsers = new Set<string>()
//     const userReactions: any[] = []

//     const reactionsCounter = {
//       like: 0,
//       love: 0,
//       haha: 0,
//       wow: 0,
//       sad: 0,
//       angry: 0
//     }

//     for (let j = 0; j < reactionCount; j++) {
//       const userId = randomFromArray(userIds)
//       if (usedUsers.has(userId.toString())) continue

//       usedUsers.add(userId.toString())
//       const reaction = randomFromArray([...REACTIONS])

//       userReactions.push({
//         userId,
//         reactions: reaction,
//         reactionAt: new Date()
//       })

//       reactionsCounter[reaction]++
//     }

//     posts.push({
//       author,
//       content: `Đây là bài post số ${i + 1}`,
//       images: Math.random() > 0.7 ? [`https://picsum.photos/seed/${i}/600/400`] : [],
//       reactions: reactionsCounter,
//       userReactions,
//       visibility: randomFromArray(['public', 'friends', 'private']),
//       deleted: false
//     })
//   }

//   return posts
// }

// const seedPosts = async () => {
//   await PostModel.deleteMany({})
//   const posts = generatePosts()
//   await PostModel.insertMany(posts)
//   console.log(`✅ Seed ${posts.length} posts thành công`)
// }

// const seedAll = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/Mini_Social')

//     await UserModel.deleteMany({})
//     const users = await generateUsers()
//     await UserModel.insertMany(users)
//     console.log('✅ Seed users xong')

//     await seedPosts()

//     console.log('🎉 Seed USERS + POSTS hoàn tất')
//     process.exit(0)
//   } catch (err) {
//     console.error('❌ Seed lỗi:', err)
//     process.exit(1)
//   }
// }

// seedAll()

// import 'dotenv/config'
// import mongoose, { Types } from 'mongoose'
// import CommentModel from './models/comment.model'
// import PostModel from './models/post.model'
// import UserModel from './models/user.model'

// const MONGO_URI = 'mongodb://localhost:27017/Mini_Social'

// // tiện ích random
// const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// /**
//  * 🔥 Đếm TẤT CẢ reply (mọi tầng)
//  */
// const countAllReplies = (commentId: Types.ObjectId, comments: any[]): number => {
//   const directReplies = comments.filter((c) => c.parentCommentId?.toString() === commentId.toString())

//   let count = directReplies.length

//   for (const reply of directReplies) {
//     count += countAllReplies(reply._id, comments)
//   }

//   return count
// }

// const seedComments = async () => {
//   await mongoose.connect(MONGO_URI)

//   console.log('🗑 Xoá comment cũ...')
//   await CommentModel.deleteMany({})

//   const posts = await PostModel.find().select('_id')
//   const users = await UserModel.find().select('_id')

//   if (!posts.length || !users.length) {
//     throw new Error('❌ Chưa có post hoặc user')
//   }

//   const comments: any[] = []

//   // ===============================
//   // 1️⃣ TẠO COMMENT (3–4 TẦNG)
//   // ===============================
//   posts.forEach((post) => {
//     const rootCount = Math.floor(Math.random() * 3) + 2 // 2–4 comment gốc

//     for (let i = 0; i < rootCount; i++) {
//       const rootId = new Types.ObjectId()

//       comments.push({
//         _id: rootId,
//         postId: post._id,
//         userId: randomFromArray(users)._id,
//         content: 'Comment gốc',
//         parentCommentId: null,
//         replyCount: 0,
//         deleted: false
//       })

//       // tầng 2
//       const level2Count = Math.floor(Math.random() * 3) + 1
//       for (let j = 0; j < level2Count; j++) {
//         const lv2Id = new Types.ObjectId()

//         comments.push({
//           _id: lv2Id,
//           postId: post._id,
//           userId: randomFromArray(users)._id,
//           content: 'Reply level 2',
//           parentCommentId: rootId,
//           replyCount: 0,
//           deleted: false
//         })

//         // tầng 3
//         const level3Count = Math.floor(Math.random() * 2) + 1
//         for (let k = 0; k < level3Count; k++) {
//           const lv3Id = new Types.ObjectId()

//           comments.push({
//             _id: lv3Id,
//             postId: post._id,
//             userId: randomFromArray(users)._id,
//             content: 'Reply level 3',
//             parentCommentId: lv2Id,
//             replyCount: 0,
//             deleted: false
//           })

//           // tầng 4 (ít hơn)
//           if (Math.random() > 0.6) {
//             comments.push({
//               _id: new Types.ObjectId(),
//               postId: post._id,
//               userId: randomFromArray(users)._id,
//               content: 'Reply level 4',
//               parentCommentId: lv3Id,
//               replyCount: 0,
//               deleted: false
//             })
//           }
//         }
//       }
//     }
//   })

//   // ===============================
//   // 2️⃣ TÍNH replyCount (CHUẨN)
//   // ===============================
//   comments.forEach((comment) => {
//     comment.replyCount = countAllReplies(comment._id, comments)
//   })

//   // ===============================
//   // 3️⃣ INSERT COMMENT
//   // ===============================
//   await CommentModel.insertMany(comments)
//   console.log(`✅ Seed ${comments.length} comments`)

//   // ===============================
//   // 4️⃣ UPDATE commentCount cho Post
//   // ===============================
//   for (const post of posts) {
//     const total = comments.filter((c) => c.postId.toString() === post._id.toString()).length

//     await PostModel.updateOne({ _id: post._id }, { $set: { commentCount: total } })
//   }

//   console.log('✅ Update commentCount cho post thành công')

//   process.exit(0)
// }

// seedComments().catch((err) => {
//   console.error('❌ Seed comment lỗi:', err)
//   process.exit(1)
// })

// import mongoose from 'mongoose'
// import ConversationModel from './models/conversation.model'
// import UserModel from './models/user.model'

// const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Mini_Social'

// const LAN_ANH_ID = new mongoose.Types.ObjectId('69886842bee9b6f4f3bbf3a1')

// const groupAvatars = [
//   'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
//   'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
//   'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
//   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
//   'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
// ]

// const randomAvatar = () => groupAvatars[Math.floor(Math.random() * groupAvatars.length)]

// const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5)

// const seedConversations = async () => {
//   try {
//     // ===== CONNECT =====
//     await mongoose.connect(MONGO_URI)
//     console.log('✅ Connected DB:', mongoose.connection.name)

//     // ===== CLEAR OLD DATA =====
//     await ConversationModel.deleteMany({})
//     console.log('🗑️ Cleared old conversations')

//     // ===== CHECK LAN ANH =====
//     const lanAnh = await UserModel.findById(LAN_ANH_ID)
//     if (!lanAnh) {
//       console.log('❌ Lan Anh not found')
//       return
//     }

//     // ===== GET OTHER USERS =====
//     const otherUsers = await UserModel.find({
//       _id: { $ne: LAN_ANH_ID }
//     }).select('_id firstName avatar')

//     if (otherUsers.length === 0) {
//       console.log('❌ No other users')
//       return
//     }

//     const conversations: any[] = []

//     // ====================================================
//     // PRIVATE CHAT
//     // ====================================================
//     for (const user of otherUsers) {
//       conversations.push({
//         members: [LAN_ANH_ID, user._id],
//         type: 'private', // set rõ ràng
//         groupName: null,
//         avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
//         groupAdmin: [],
//         lastMessage: 'Chào bạn nhé 😊',
//         lastSenderId: LAN_ANH_ID,
//         lastMessageAt: new Date(),
//         unReadCount: [
//           { userId: LAN_ANH_ID, count: 0 },
//           { userId: user._id, count: 1 }
//         ]
//       })
//     }

//     // ====================================================
//     // GROUP CHAT
//     // ====================================================
//     const groupCount = Math.min(5, Math.floor(otherUsers.length / 2))

//     for (let i = 0; i < groupCount; i++) {
//       const shuffledUsers = shuffle(otherUsers)

//       const groupMembers = [LAN_ANH_ID, shuffledUsers[0]._id, shuffledUsers[1]._id]

//       conversations.push({
//         members: groupMembers,
//         type: 'group', // QUAN TRỌNG
//         groupName: `Nhóm Lan Anh ${i + 1}`, // KHÔNG NULL
//         avatar: randomAvatar(),
//         groupAdmin: [LAN_ANH_ID],
//         lastMessage: 'Hello mọi người 🚀',
//         lastSenderId: LAN_ANH_ID,
//         lastMessageAt: new Date(),
//         unReadCount: groupMembers.map((id) => ({
//           userId: id,
//           count: id.equals(LAN_ANH_ID) ? 0 : Math.floor(Math.random() * 5) + 1
//         }))
//       })
//     }

//     // ===== INSERT =====
//     await ConversationModel.insertMany(conversations)
//     console.log('🔥 Inserted conversations:', conversations.length)

//     // ===== VERIFY =====
//     const checkGroups = await ConversationModel.find({
//       type: 'group'
//     }).select('type groupName')

//     console.log('📌 Group conversations in DB:')
//     console.log(checkGroups)

//     await mongoose.disconnect()
//     console.log('✅ Done & Disconnected')
//   } catch (err) {
//     console.error(err)
//     await mongoose.disconnect()
//   }
// }

// seedConversations()

import mongoose from 'mongoose'
import ConversationModel from './models/conversation.model'
import MessageModel from './models/message.model'

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Mini_Social'

const randomMessages = [
  'Chào bạn 👋',
  'Đi ăn không?',
  'Tối nay rảnh không?',
  'Hello mọi người 🚀',
  'Haha vui ghê 😂',
  'Ok luôn 👍',
  'Để mình xem đã',
  'Chuẩn rồi đó',
  'Mai gặp nhé',
  'Gọi mình khi tới nha'
]

const randomContent = () => randomMessages[Math.floor(Math.random() * randomMessages.length)]

const randomDate = () => new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))

const seedMessages = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected DB')

    // ===== XOÁ MESSAGE CŨ =====
    await MessageModel.deleteMany({})
    console.log('🗑️ Cleared old messages')

    const conversations = await ConversationModel.find()

    if (conversations.length === 0) {
      console.log('❌ Không có conversation')
      return
    }

    for (const convo of conversations) {
      const messageCount = Math.floor(Math.random() * 10) + 5 // 5–15 tin nhắn

      let lastMessageDoc: any = null

      for (let i = 0; i < messageCount; i++) {
        const sender = convo.members[Math.floor(Math.random() * convo.members.length)]

        // random ai đã đọc
        const readBy = convo.members.filter((member: any) => Math.random() > 0.3 || member.equals(sender))

        const message = await MessageModel.create({
          conversationId: convo._id,
          sender,
          content: randomContent(),
          readBy,
          images: []
        })

        lastMessageDoc = message
      }

      // ===== UPDATE conversation theo tin nhắn cuối =====
      if (lastMessageDoc) {
        const unreadMap = convo.members.map((member: any) => {
          const isRead = lastMessageDoc.readBy.some((id: any) => id.equals(member))

          return {
            userId: member,
            count: isRead ? 0 : 1
          }
        })

        await ConversationModel.findByIdAndUpdate(convo._id, {
          lastMessage: lastMessageDoc.content,
          lastSenderId: lastMessageDoc.sender,
          lastMessageAt: lastMessageDoc.createdAt,
          unReadCount: unreadMap
        })
      }
    }

    console.log('🔥 Seed Message thành công!')
    await mongoose.disconnect()
  } catch (err) {
    console.error(err)
    await mongoose.disconnect()
  }
}

seedMessages()
