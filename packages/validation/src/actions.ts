import { z } from 'zod'

import { password, username } from './partials'

const image = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
})

export const registerActionSchema = z.object({
  username: username,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  password: password,
  // TODO: the image will need to be updated because when sending the image from the client it will be a file
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
