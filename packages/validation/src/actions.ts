import { z } from 'zod'

import { _id, password, username } from './partials'

const imageMetadata = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
})

const imageFile = z.instanceof(File)

export const registerActionSchema = z.object({
  username: username,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  password: password,
  // TODO: the image will need to be updated because when sending the image from the client it will be a file
  image: imageMetadata.optional(),
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

// TODO: make this usable with the server schema
// this is currently only used on the client
export const capsuleActionSchema = z.object({
  title: z.string().min(1),
  openDate: z.string().datetime().optional(),
  showCountdown: z.boolean().optional(),
  visibility: z.enum(['public', 'private']),
  content: z.string().optional(),
  images: z.array(imageFile).min(1).optional(),
  collaborators: z.array(_id).min(1).optional(),
  receivers: z.array(_id).min(1).optional(),
})

export type CapsuleValues = z.infer<typeof capsuleActionSchema>
