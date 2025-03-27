import { z } from 'zod'

import { Capsule, TCapsule } from '../models/capsule'
import { handle } from '../lib/handler'
import {
  imageSchema,
  multipartFormBoolean,
  multipartFormObjectIdArray,
  objectIdSchema,
} from '../lib/validation'
import { AuthError, HandlerError, NotFoundError } from '../lib/errors'
import { onlyDefinedValues } from '../lib/only-defined-values'

const filterCapsuleResponse = (
  filter: 'unsealed' | 'sealed' | 'opened',
  capsule: TCapsule,
) => {
  const {
    _id,
    title,
    content,
    showCountdown,
    openDate,
    sealedAt,
    visibility,
    state,
    senders,
    receivers,
  } = capsule

  const images = capsule.images.map((image) => ({
    name: image.name,
    type: image.type,
  }))

  switch (filter) {
    case 'unsealed':
      return {
        id: _id,
        title,
        content,
        images,
        visibility,
        state,
        showCountdown,
        senders,
        receivers,
      }
    case 'sealed':
      return {
        id: _id,
        openDate,
        state,
        senders,
        receivers,
      }
    case 'opened':
      return {
        id: _id,
        title,
        content,
        images,
        openDate,
        sealedAt,
        visibility,
        state,
        showCountdown,
        senders,
        receivers,
      }
  }
}

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

      if (!(capsule.state === 'unsealed')) {
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

      const { showCountdown, visibility, state } = capsule

      switch (state) {
        case 'unsealed':
          if (!userId || !capsule.isSentBy(userId)) {
            throw new HandlerError(
              'you are not allowed to access this capsule',
              403,
            )
          }

          res.status(200).json(filterCapsuleResponse('unsealed', capsule))
          return
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

          res.status(200).json(filterCapsuleResponse('sealed', capsule))
          return
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

          res.status(200).json(filterCapsuleResponse('opened', capsule))
          return
      }
    },
    {
      authentication: 'optional',
      schemas: { params: z.object({ id: objectIdSchema }) },
    },
  ),
  getUserCapsules: handle(
    async ({ res, queryParams, userId }) => {
      const draftFilter = {
        senders: { $in: [userId] },
        state: 'unsealed',
      }

      const sentFilter = {
        senders: { $in: [userId] },
      }

      const receivedFilter = {
        receivers: { $in: [userId] },
        state: 'opened',
      }

      const filters = {
        default: {
          $or: [sentFilter, receivedFilter, draftFilter],
        },
        draft: draftFilter,
        sent: sentFilter,
        received: receivedFilter,
      }

      const filter = filters[queryParams?.type || 'default']
      const limit = queryParams?.take || 10
      const skip = queryParams?.skip || 0

      const capsules = await Capsule.aggregate([
        {
          $addFields: {
            state: {
              $switch: {
                branches: [
                  {
                    case: { $not: ['$openDate'] },
                    then: 'unsealed',
                  },
                  {
                    case: { $gte: ['$openDate', '$$NOW'] },
                    then: 'sealed',
                  },
                  {
                    case: { $lte: ['$openDate', '$$NOW'] },
                    then: 'opened',
                  },
                ],
              },
            },
            openDateDiff: {
              $divide: [
                { $subtract: ['$openDate', '$$NOW'] },
                1000 * 60 * 60 * 24, // convert milliseconds to days
              ],
            },
            hasOpenDate: {
              $cond: { if: { $gt: ['$openDate', null] }, then: 1, else: 0 },
            },
          },
        },
        { $match: filter },
        {
          $sort: {
            hasOpenDate: -1, // prioritize capsules with an open date
            openDateDiff: 1,
            sealedAt: -1,
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])

      res
        .status(200)
        .json(
          capsules.map((capsule) =>
            filterCapsuleResponse(capsule.state, capsule),
          ),
        )
    },
    {
      authentication: 'required',
      schemas: {
        queryParams: z
          .object({
            type: z.enum(['draft', 'sent', 'received']).optional(),
            take: z.coerce.number().min(1).optional(),
            skip: z.coerce.number().min(1).optional(),
          })
          .optional(),
      },
    },
  ),
}
