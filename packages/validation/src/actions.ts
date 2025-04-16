import { z } from 'zod'

import { imageSchema, passwordSchema, usernameSchema } from './partials'

export const registerActionSchema = z.object({
  username: usernameSchema,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  password: passwordSchema,
  image: imageSchema.optional(),
})

export const loginActionSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1),
  })
  .refine(({ username, email }) => username || email, {
    message: 'either username or email must be provided',
  })

export type LoginValues = z.infer<typeof loginActionSchema>
