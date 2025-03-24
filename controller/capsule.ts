import { z } from 'zod'

import { Capsule } from '../models/capsule'
import { handle } from '../lib/handler'
import {
  imageSchema,
  multipartFormBoolean,
  multipartFormObjectIdArray,
  objectIdSchema,
} from '../lib/validation'
import { AuthError, HandlerError, NotFoundError } from '../lib/errors'
import { onlyDefinedValues } from '../lib/only-defined-values'

export const capsuleController = {
  createCapsule: handle(
    async ({ res, values: { collaborators, ...rest }, userId }) => {
      const capsule = new Capsule({
        senders: [userId, ...(collaborators || [])],
        ...rest,
      })

      await capsule.save()
      res.status(201).json({ id: capsule._id })
    },
    {
      authenticate: true,
      schemas: {
        values: z.object({
          title: z.string().min(1),
          openDate: z.string().datetime().optional(),
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
  editCapsule: handle(
    async ({
      res,
      params: { id },
      values: { collaborators, ...rest },
      userId,
    }) => {
      const capsule = await Capsule.findById(id)

      if (!capsule) {
        throw new NotFoundError('capsule not found')
      }

      if (!capsule.isSentBy(userId)) {
        throw new AuthError('you are not allowed to edit this capsule', 403)
      }

      if (!(capsule.getState() === 'unsealed')) {
        throw new HandlerError('capsule is sealed and can not be edited', 423)
      }

      capsule.set(
        onlyDefinedValues({
          senders: [userId, ...(collaborators || [])],
          ...rest,
        }),
      )

      await capsule.save()
      res.status(204).send()
    },
    {
      authenticate: true,
      schemas: {
        params: z.object({ id: objectIdSchema }),
        values: z.object({
          title: z.string().min(1).optional(),
          openDate: z.string().datetime().optional(),
          showCountdown: multipartFormBoolean.optional(),
          visibility: z.enum(['public', 'private']).optional(),
          content: z.string().optional(),
          images: z.array(imageSchema).min(1).optional(),
          collaborators: multipartFormObjectIdArray.optional(),
          receivers: multipartFormObjectIdArray.optional(),
        }),
      },
    },
  ),
  deleteCapsule: handle(
    async ({ res, params: { id }, userId }) => {
      const capsule = await Capsule.findById(id)

      if (!capsule) {
        throw new NotFoundError('capsule not found')
      }

      if (!capsule.isSentBy(userId)) {
        throw new AuthError('you are not allowed to delete this capsule', 403)
      }

      await capsule.deleteOne()
      res.status(204).send()
    },
    {
      authenticate: true,
      schemas: { params: z.object({ id: objectIdSchema }) },
    },
  ),
}
