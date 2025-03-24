import z from 'zod'
import { Types } from 'mongoose'
import type { NextFunction, Request, Response } from 'express'

import { validate } from './validation'
import { handleError } from './errors'
import { authenticate } from '../middlewares/authenticate'
import { getBucketConnection } from './file'

type UserId<T> = T extends 'required'
  ? Types.ObjectId
  : T extends 'optional'
    ? Types.ObjectId | null
    : null

type HandlerArguments<Params, Values, Cookies, UserId> = {
  req: Request
  params: Params
  res: Response
  values: Values
  cookies: Cookies
  userId: UserId
  next: NextFunction
}

type HandlerFunction<Params, Values, Cookies, UserId> = (
  args: HandlerArguments<Params, Values, Cookies, UserId>,
) => Promise<void> | void

const upload = async (req: Request) => {
  const bucket = getBucketConnection()

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
  Authentication extends 'required' | 'optional' | boolean = false,
>(
  callback: HandlerFunction<Params, Values, Cookies, UserId<Authentication>>,
  options?: {
    schemas?: {
      params?: z.Schema<Params>
      values?: z.Schema<Values>
      cookies?: z.Schema<Cookies>
    }
    authentication?: Authentication
  },
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = options?.authentication
        ? options.authentication === 'required'
          ? await authenticate(req, true)
          : await authenticate(req, false)
        : null

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
        userId: userId as UserId<Authentication>,
        next,
      } satisfies HandlerArguments<
        Params,
        Values,
        Cookies,
        UserId<Authentication>
      >

      await callback(args)
    } catch (error) {
      handleError({ error, res })
    }
  }
}
