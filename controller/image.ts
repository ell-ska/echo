import type { Response } from 'express'

import { handle } from '../lib/handler'
import { getBucketConnection, getFileId } from '../lib/file'
import { UnexpectedError } from '../lib/errors'
import { User } from '../models/user'

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
  getCurrentUserImage: handle(
    async ({ res, userId }) => {
      const metadata = (await User.findById(userId).populate('image'))!.image

      await imageResponse({ res, name: metadata.name, type: metadata.type })
    },
    {
      authenticate: true,
    },
  ),
}
