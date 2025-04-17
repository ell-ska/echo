import { z } from 'zod'

import { id } from './partials'

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
})

const image = z.object({
  name: z.string(),
  type: z.string(),
})

const user = z.object({
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image,
})

const capsule = z.object({
  id,
  visibility: z.enum(['public', 'private']),
  senders: z.array(user).nonempty(),
  receivers: z.array(user),
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
