import { connection, mongo, Types } from 'mongoose'

export const deleteFile = async (name: string) => {
  const bucket = new mongo.GridFSBucket(connection.db!, {
    bucketName: 'images',
  })

  const id = name.split('-')[0]
  const objectId = new Types.ObjectId(id)

  await bucket.delete(objectId)
}
