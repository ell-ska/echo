import { z } from 'zod'

import { id } from './partials'

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
})

const capsule = z.object({
  id,
  visibility: z.enum(['public', 'private']),
  senders: z.array(id),
  receivers: z.array(id),
})

const unsealedCapsule = capsule.merge(
  z.object({
    state: z.literal('unsealed'),
    showCountdown: z.boolean(),
    title: z.string(),
    content: z.string().optional(),
    images: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
      })
    ),
  })
)

const sealedCapsule = capsule.merge(
  z.object({ state: z.literal('sealed'), openDate: z.date() })
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
    openDate: z.date(),
    sealedAt: z.date(),
  })
)

export const capsuleResponseSchema = z.discriminatedUnion('state', [
  unsealedCapsule,
  sealedCapsule,
  openedCapsule,
])

export type CapsuleData = z.infer<typeof capsuleResponseSchema>
