import { z } from 'zod'

import { _id } from './partials'

const image = z.object({
  name: z.string(),
  type: z.string(),
})

export type ImageData = z.infer<typeof image>

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
})

export const userResponseSchema = z.object({
  _id,
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: image.optional(),
})

export type UserData = z.infer<typeof userResponseSchema>

const capsule = z.object({
  _id,
  visibility: z.enum(['public', 'private']),
  senders: z.array(userResponseSchema).nonempty(),
  receivers: z.array(userResponseSchema),
})

const unsealedCapsule = capsule.merge(
  z.object({
    state: z.literal('unsealed'),
    showCountdown: z.boolean(),
    title: z.string(),
    content: z.string().optional(),
    images: z.array(image),
  })
)

const sealedCapsule = capsule.merge(
  z.object({ state: z.literal('sealed'), openDate: z.coerce.date() })
)

const openedCapsule = capsule.merge(
  z.object({
    state: z.literal('opened'),
    title: z.string(),
    content: z.string().optional(),
    images: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
      })
    ),
    openDate: z.coerce.date(),
    sealedAt: z.coerce.date(),
  })
)

export const capsuleResponseSchema = z.discriminatedUnion('state', [
  unsealedCapsule,
  sealedCapsule,
  openedCapsule,
])

export type CapsuleData = z.infer<typeof capsuleResponseSchema>
