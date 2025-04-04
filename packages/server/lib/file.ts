import mongoose from 'mongoose'
import { objectIdSchema, validate } from './validation'

export const getBucketConnection = () => {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
    bucketName: 'images',
  })
}

export const getFileId = (name: string) => {
  const id = name.split('-')[0]
  validate(objectIdSchema, id)

  return new mongoose.Types.ObjectId(id)
}

export const deleteFile = async (name: string) => {
  const bucket = getBucketConnection()
  const id = getFileId(name)
  await bucket.delete(id)
}
