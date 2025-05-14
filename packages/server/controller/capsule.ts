import { z } from 'zod'

import { Capsule, TCapsule } from '../models/capsule'
import { handle } from '../lib/handler'
import {
  imageSchema,
  multipartFormBoolean,
  multipartFormObjectIdArray,
  objectIdSchema,
} from '../lib/validation'
import {
  AuthError,
  HandlerError,
  NotFoundError,
  ValidationError,
} from '../lib/errors'
import { onlyDefinedValues } from '../lib/only-defined-values'
import { capsuleResponseSchema } from '@repo/validation/data'

const filterCapsuleResponse = (capsule: TCapsule) => {
  // these need to be destructured for some reason, thanks mongoose
  const {
    _id,
    state,
    visibility,
    senders,
    receivers,
    showCountdown,
    title,
    content,
    images,
    openDate,
    sealedAt,
  } = capsule

  const { error, data } = capsuleResponseSchema.safeParse({
    _id,
    state,
    visibility,
    senders,
    receivers,
    showCountdown,
    title,
    content,
    images: images.map((image) => ({
      name: image.name,
      type: image.type,
    })),
    openDate,
    sealedAt,
  })

  if (error) {
    throw new ValidationError(error)
  }

  return data
}

const getCapsules = async ({
  filters,
  queryParams,
}: {
  filters: {
    [key: string]: object
  }
  queryParams?: {
    type?: string
    take?: number
    skip?: number
  }
}) => {
  const filter = filters[queryParams?.type || 'default']
  const limit = queryParams?.take || 10
  const skip = queryParams?.skip || 0

  const lookupUsers = (field: string) => {
    return {
      from: 'users',
      localField: field,
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            image: 1,
            username: 1,
            firstName: 1,
            lastName: 1,
          },
        },
      ],
      as: field,
    }
  }

  return await Capsule.aggregate([
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
    {
      $lookup: lookupUsers('senders'),
    },
    {
      $lookup: lookupUsers('receivers'),
    },
  ])
}

const populateUser = 'image username firstName lastName'

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
        .populate('senders', populateUser)
        .populate('receivers', populateUser)

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

          res.status(200).json(filterCapsuleResponse(capsule))
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

          res.status(200).json(filterCapsuleResponse(capsule))
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

          res.status(200).json(filterCapsuleResponse(capsule))
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

      const capsules = await getCapsules({ filters, queryParams })

      res
        .status(200)
        .json(capsules.map((capsule) => filterCapsuleResponse(capsule)))
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
  getPublicCapsules: handle(
    async ({ res, queryParams }) => {
      const sealedFilter = {
        visibility: 'public',
        state: 'sealed',
        showCountdown: true,
      }

      const openedFilter = {
        visibility: 'public',
        state: 'opened',
      }

      const filters = {
        default: {
          $or: [sealedFilter, openedFilter],
        },
        sealed: sealedFilter,
        opened: openedFilter,
      }

      const capsules = await getCapsules({ filters, queryParams })

      res
        .status(200)
        .json(capsules.map((capsule) => filterCapsuleResponse(capsule)))
    },
    {
      schemas: {
        queryParams: z
          .object({
            type: z.enum(['sealed', 'opened']).optional(),
            take: z.coerce.number().min(1).optional(),
            skip: z.coerce.number().min(1).optional(),
          })
          .optional(),
      },
    },
  ),
}
