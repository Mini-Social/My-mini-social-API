import zod from 'zod'
export const userSchema = zod
  .object({
    firstName: zod.string().min(3, 'First name must be at least 3 characters.'),
    lastName: zod.string().min(3, 'Last name must be at least 3 characters.'),
    userName: zod.string().min(5, 'Username must be at least 5 characters.').trim().toLowerCase(),
    email: zod.string().email('Invalid email address.').trim().toLowerCase(),
    password: zod.string().min(6, 'Password must be at least 6 characters.'),
    passwordConfirm: zod.string().min(6, 'Password confirm must be at least 6 characters.'),
    avatar: zod.string().optional(),
    background: zod.string().optional(),
    coverPosition: zod.number().optional(),
    bio: zod.string().optional(),
    gender: zod.string().optional().nullable(),
    address: zod.string().optional(),
    phone: zod.string().optional().nullable(),
    birthDate: zod.union([zod.coerce.date().optional(), zod.null()]).optional(),
    relationship: zod.string().optional().nullable()
  })
  .refine((val) => val.password === val.passwordConfirm, {
    message: 'Passwords do not match.',
    path: ['passwordConfirm']
  })
export const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: zod.string().min(6, 'Password must be at least 6 characters')
})
export const postSchema = zod.object({
  content: zod.string().optional(),
  images: zod.array(zod.string()).optional(),
  visibility: zod.enum(['public', 'friends', 'private']).optional().default('public'),
  sharePostId: zod.string().nullable().optional()
})
export const shareSchema = zod.object({
  content: zod.string().optional(),
  visibility: zod.enum(['public', 'friend', 'private']).default('public').optional()
})
export const commentSchema = zod.object({
  content: zod.string().optional(),
  image: zod.string().optional()
})
export const conversationSchema = zod.object({
  groupName: zod.string().optional(),
  avatar: zod.string().optional()
})
export const messageSchema = zod
  .object({
    content: zod.string().optional(),
    images: zod.array(zod.string()).optional()
  })
  .refine(
    (data) => {
      const hasContent = data.content && data.content?.trim().length > 0
      const hasImages = data.images && data.images.length > 0

      return hasContent || hasImages
    },
    {
      message: 'Message have to need content or image'
    }
  )
