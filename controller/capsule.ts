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
      authentication: 'required',
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
      authentication: 'required',
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
      authentication: 'required',
      schemas: { params: z.object({ id: objectIdSchema }) },
    },
  ),
  getCapsuleById: handle(
    async ({ res, params: { id }, userId }) => {
      const capsule = await Capsule.findById(id)

      if (!capsule) {
        throw new NotFoundError('capsule not found')
      }

      const {
        title,
        content,
        showCountdown,
        openDate,
        sealedAt,
        visibility,
        senders,
        receivers,
      } = capsule

      const images = capsule.images.map((image) => ({
        name: image.name,
        type: image.type,
      }))

      const state = capsule.getState()

      switch (state) {
        case 'unsealed':
          if (!userId || !capsule.isSentBy(userId)) {
            throw new HandlerError(
              'you are not allowed to access this capsule',
              403,
            )
          }

          res.status(200).json({
            id,
            title,
            content,
            images,
            visibility,
            showCountdown,
            senders,
            receivers,
          })
          break
        case 'sealed':
          if (
            visibility === 'private' &&
            (!userId || !capsule.isSentBy(userId))
          ) {
            throw new HandlerError(
              'you are not allowed to access this capsule',
              403,
            )
          }

          if (
            visibility === 'public' &&
            (!userId || !capsule.isSentBy(userId)) &&
            !showCountdown
          ) {
            throw new HandlerError(
              'capsule is sealed and cannot be opened yet',
              423,
            )
          }

          res.status(200).json({
            openDate,
          })
          break
        case 'opened':
          if (
            visibility === 'private' &&
            (!userId ||
              (!capsule.isSentBy(userId) && !capsule.isReceivedBy(userId)))
          ) {
            throw new HandlerError(
              'you are not allowed to access this capsule',
              403,
            )
          }

          res.status(200).json({
            id,
            title,
            content,
            images,
            openDate,
            sealedAt,
            visibility,
            showCountdown,
            senders,
            receivers,
          })
          break
      }

      res.status(500).send('capsule state not covered')
    },
    {
      authentication: 'optional',
      schemas: { params: z.object({ id: objectIdSchema }) },
    },
  ),
}
