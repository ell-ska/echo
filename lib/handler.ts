import z from 'zod'
import { connection, mongo } from 'mongoose'
import type { NextFunction, Request, Response } from 'express'

import { validate } from './validation'
import { handleError } from './errors'
import { authenticate } from '../middlewares/authenticate'

type UserId<T extends boolean> = T extends true ? string : null

type HandlerArguments<
  Params,
  Values,
  Cookies,
  Authenticated extends boolean,
> = {
  req: Request
  params: Params
  res: Response
  values: Values
  cookies: Cookies
  userId: UserId<Authenticated>
  next: NextFunction
}

type HandlerFunction<Params, Values, Cookies, Authenticated extends boolean> = (
  args: HandlerArguments<Params, Values, Cookies, Authenticated>,
) => Promise<void> | void

const upload = async (req: Request) => {
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
  Authenticated extends boolean = false,
>(
  callback: HandlerFunction<Params, Values, Cookies, Authenticated>,
  options?: {
    schemas?: {
      params?: z.Schema<Params>
      values?: z.Schema<Values>
      cookies?: z.Schema<Cookies>
    }
    authenticate?: Authenticated
  },
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (
        options?.authenticate ? await authenticate(req) : null
      ) as UserId<Authenticated>

      const params = validate(options?.schemas?.params, req.params)

      if (req.file || req.files) {
        await upload(req)
      }

      const values = validate(options?.schemas?.values, req.body)
      const cookies = validate(options?.schemas?.cookies, req.cookies)

      const args = {
        req,
        params: params as Params,
        res,
        values: values as Values,
        cookies: cookies as Cookies,
        userId,
        next,
      } satisfies HandlerArguments<Params, Values, Cookies, Authenticated>

      await callback(args)
    } catch (error) {
      handleError({ error, res })
    }
  }
}
