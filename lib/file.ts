import { connection, mongo, Types } from 'mongoose'
import { objectIdSchema, validate } from './validation'

export const getBucketConnection = () => {
  return new mongo.GridFSBucket(connection.db!, {
    bucketName: 'images',
  })
}

export const getFileId = (name: string) => {
  const id = name.split('-')[0]
  validate(objectIdSchema, id)

  return new Types.ObjectId(id)
}

export const deleteFile = async (name: string) => {
  const bucket = getBucketConnection()
  const id = getFileId(name)
  await bucket.delete(id)
}
