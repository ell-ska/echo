import type { Response } from 'express'

import { handle } from '../lib/handler'
import { getBucketConnection, getFileId } from '../lib/file'
import { NotFoundError, UnexpectedError } from '../lib/errors'
import { User } from '../models/user'
import { z } from 'zod'
import { objectIdSchema } from '../lib/validation'

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
      authenticate: true,
    },
  ),
}
