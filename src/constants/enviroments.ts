import 'dotenv/config'
import zod from 'zod'
const envSchema = zod.object({
  PORT: zod.coerce.number().default(3000),
  MONGODB_URI: zod.string(),
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('development'),
  JWT_SUPERSECRET: zod.string(),
  JWT_COOKIE_EXPIRED_IN: zod.string()
})

export const env = envSchema.parse(process.env)
