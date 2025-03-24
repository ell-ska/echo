import { z } from 'zod'

import { Capsule } from '../models/capsule'
import { handle } from '../lib/handler'
import {
  imageSchema,
  multipartFormBoolean,
  multipartFormObjectIdArray,
} from '../lib/validation'

export const capsuleController = {
  createCapsule: handle(
    async ({
      res,
      values: {
        title,
        unlockDate,
        showCountdown,
        visibility,
        content,
        images,
        collaborators,
        receivers,
      },
      userId,
    }) => {
      const capsule = await Capsule.create({
        title,
        unlockDate,
        lockedAt: unlockDate ? new Date() : undefined,
        showCountdown,
        visibility,
        content,
        images: images,
        senders: [userId, ...(collaborators || [])],
        receivers,
      })

      res.status(201).json({ id: capsule._id })
    },
    {
      authenticate: true,
      schemas: {
        values: z.object({
          title: z.string().min(1),
          unlockDate: z.string().datetime().optional(),
          showCountdown: multipartFormBoolean.optional(),
          visibility: z.enum(['public', 'private']),
          content: z.string().optional(),
          images: z.array(imageSchema).min(1).optional(),
          collaborators: multipartFormObjectIdArray.optional(),
          receivers: multipartFormObjectIdArray.optional(),
        }),
      },
    },
  ),
}
