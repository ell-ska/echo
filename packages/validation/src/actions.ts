import { z } from 'zod'

import { image, password, username } from './partials'

export const registerActionSchema = z.object({
  username: username,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  password: password,
  image: image.optional(),
})

export type RegisterValues = z.infer<typeof registerActionSchema>

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
