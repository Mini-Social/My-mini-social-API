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
    bio: zod.string().optional(),
    gender: zod.enum(['Male', 'Female'], 'Invalid gender.').optional(),
    phone: zod.string().optional(),
    birthDate: zod.coerce.date().optional()
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
  visibility: zod.enum(['public', 'friend', 'private']).optional().default('public'),
  sharePostId: zod.string().nullable().optional()
})
