import { z } from 'zod'
import type { Response } from 'express'

import { User } from '../models/user'
import { handle } from '../lib/handler'
import { getBucketConnection, getFileId } from '../lib/file'
import { HandlerError, NotFoundError, UnexpectedError } from '../lib/errors'
import { objectIdSchema } from '../lib/validation'
import { Capsule } from '../models/capsule'

const imageResponse = async ({
  res,
  name,
  type,
}: {
  res: Response
  name: string
  type: string
}) => {
  const bucket = getBucketConnection()
  const id = getFileId(name)
  const downloadStream = bucket.openDownloadStream(id)

  res.set('Content-Type', type)

  downloadStream.on('data', (chunk) => {
    res.write(chunk)
  })

  downloadStream.on('error', (error) => {
    throw new UnexpectedError(
      error.message,
      'something went wrong when downloading the image',
      500,
      'database_download_image',
    )
  })

  downloadStream.on('end', () => {
    res.end()
  })
}

export const imageController = {
  getUserImageById: handle(
    async ({ res, params: { id } }) => {
      const user = await User.findById(id).populate('image')
      if (!user) {
        throw new NotFoundError('user not found')
      }

      const metadata = user.image
      if (!metadata) {
        throw new NotFoundError('image not found')
      }

      await imageResponse({ res, name: metadata.name, type: metadata.type })
    },
    {
      schemas: { params: z.object({ id: objectIdSchema }) },
    },
  ),
  getCurrentUserImage: handle(
    async ({ res, userId }) => {
      const metadata = (await User.findById(userId).populate('image'))!.image
      if (!metadata) {
        throw new NotFoundError('image not found')
      }

      await imageResponse({ res, name: metadata.name, type: metadata.type })
    },
    {
      authentication: 'required',
    },
  ),
  getCapsuleImageByName: handle(
    async ({ res, params: { id, name }, userId }) => {
      const capsule = await Capsule.findById(id)
      if (!capsule) {
        throw new NotFoundError('capsule not found')
      }

      const { visibility, state } = capsule

      const metadata = capsule.images?.find((image) => image.name === name)
      if (!metadata) {
        throw new NotFoundError('image not found')
      }

      switch (state) {
        case 'unsealed':
          if (!userId || !capsule.isSentBy(userId)) {
            throw new HandlerError(
              'you are not allowed to access this image',
              403,
            )
          }

          await imageResponse({ res, name: metadata.name, type: metadata.type })
          return
        case 'sealed':
          throw new HandlerError(
            'capsule is sealed, image cannot be accessed',
            423,
          )
        case 'opened':
          if (
            visibility === 'private' &&
            (!userId ||
              (!capsule.isSentBy(userId) && !capsule.isReceivedBy(userId)))
          ) {
            throw new HandlerError(
              'you are not allowed to access this image',
              403,
            )
          }

          await imageResponse({ res, name: metadata.name, type: metadata.type })
      }
    },
    {
      authentication: 'optional',
      schemas: {
        params: z.object({
          id: objectIdSchema,
          name: z.string(),
        }),
      },
    },
  ),
}
