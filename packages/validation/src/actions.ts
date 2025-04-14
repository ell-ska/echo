import { z } from 'zod'

import { imageSchema, passwordSchema, usernameSchema } from './partials'

export const registerSchema = z.object({
  username: usernameSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: passwordSchema,
  image: imageSchema.optional(),
})
