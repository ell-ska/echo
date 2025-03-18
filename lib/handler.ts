import z from 'zod'
import { connection, mongo } from 'mongoose'
import type { NextFunction, Request as ExpressRequest, Response } from 'express'

import { validate } from './validation'
import { handleError } from './errors'

export type HandlerRequest = ExpressRequest & { userId?: string }

type HandlerFunction<Params, Values, Cookies> = (args: {
  req: HandlerRequest
  params: Params
  res: Response
  values: Values
  cookies: Cookies
  next: NextFunction
}) => Promise<void> | void

const upload = async (req: HandlerRequest) => {
  const bucket = new mongo.GridFSBucket(connection.db!, {
    bucketName: 'images',
  })

  const stream = async (file: Express.Multer.File) => {
    const uploadStream = bucket.openUploadStream(file.originalname)
    const id = uploadStream.id

    await new Promise((resolve, reject) => {
      uploadStream.once('finish', resolve)
      uploadStream.once('error', reject)
      uploadStream.end(file.buffer)
    })

    return {
      name: `${id.toString()}-${file.originalname}`,
      type: file.mimetype,
      size: file.size,
    }
  }

  if (req.file) {
    req.body[req.file.fieldname] = await stream(req.file)
  }

  if (req.files) {
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat()

    for (const file of files) {
      req.body[file.fieldname] = req.body[file.fieldname] || []
      req.body[file.fieldname].push(await stream(file))
    }
  }
}

export const handle = <
  Params extends unknown | null,
  Values extends unknown | null,
  Cookies extends unknown | null,
>(
  callback: HandlerFunction<Params, Values, Cookies>,
  schemas?: {
    params?: z.Schema<Params>
    values?: z.Schema<Values>
    cookies?: z.Schema<Cookies>
  },
) => {
  return async (req: HandlerRequest, res: Response, next: NextFunction) => {
    try {
      const params = validate(schemas?.params, req.params)

      if (req.file || req.files) {
        await upload(req)
      }

      const values = validate(schemas?.values, req.body)
      const cookies = validate(schemas?.cookies, req.cookies)

      await callback({
        req,
        params: params as Params,
        res,
        values: values as Values,
        cookies: cookies as Cookies,
        next,
      })
    } catch (error) {
      handleError({ error, res })
    }
  }
}
