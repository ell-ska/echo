import { z } from 'zod'

import { imageSchema, passwordSchema, usernameSchema } from './partials'

export const registerSchema = z.object({
  username: usernameSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: passwordSchema,
  image: imageSchema.optional(),
})
