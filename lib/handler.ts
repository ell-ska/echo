import z from 'zod'
import { connection, mongo } from 'mongoose'
import jwt from 'jsonwebtoken'
import type {
  NextFunction,
  Request as ExpressRequest,
  RequestHandler,
  Response,
} from 'express'

import {
  AuthError,
  HandlerError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from './errors'
import { logger } from './logger'
import { User } from '../models/user'
import { tokenSchema } from './validation'

type Request = ExpressRequest & { userId?: string }

type HandlerArguments<Params, Values> = {
  req: Request
  params: Params
  res: Response
  next: NextFunction
  values: Values
}

type HandlerFunction<Params, Values> = (
  args: HandlerArguments<Params, Values>,
) => Promise<void> | void

class Handler<Values extends unknown | null, Params extends unknown | null> {
  #valuesSchema: z.Schema<Values> | undefined
  #paramsSchema: z.Schema<Params> | undefined
  #middlewares: HandlerFunction<Params, Values>[] = []

  constructor(opts?: {
    valuesSchema?: z.Schema<Values>
    paramsSchema?: z.Schema<Params>
    middlewares: HandlerFunction<Params, Values>[]
  }) {
    if (opts?.valuesSchema) this.#valuesSchema = opts.valuesSchema
    if (opts?.paramsSchema) this.#paramsSchema = opts.paramsSchema
    if (opts?.middlewares) this.#middlewares = opts.middlewares
  }

  #validateParams(params: Request['params']): Params {
    if (!this.#paramsSchema) {
      return null as Params
    }

    const { success, error, data } = this.#paramsSchema.safeParse(params)

    if (!success) {
      throw new ValidationError(error)
    }

    return data
  }

  #validateValues(body: Request['body']): Values {
    if (!this.#valuesSchema) {
      return null as Values
    }

    const { success, error, data } = this.#valuesSchema.safeParse(body)

    if (!success) {
      throw new ValidationError(error)
    }

    return data
  }

  async #upload(req: Request) {
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

  async #executeMiddlewares({
    index = 0,
    ...args
  }: Omit<HandlerArguments<Params, Values>, 'next'> & {
    index?: number
  }) {
    const middleware = this.#middlewares[index]
    if (!middleware) return

    await middleware({
      ...args,
      next: async () => {
        await this.#executeMiddlewares({ ...args, index: index + 1 })
      },
    })
  }

  #handleError({ error, res }: { error: unknown; res: Response }) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof HandlerError ||
      error instanceof AuthError
    ) {
      return res.status(error.status).json({ error: error.message })
    }

    if (error instanceof UnexpectedError) {
      logger.error({ identifier: error.identifier, message: error.message })
      return res.status(error.status).json({ error: error.message })
    }

    logger.error({
      identifier: 'handler_unknown',
      message: error instanceof Error ? error.message : 'unknown error',
    })
    return res.status(500).json({ error: 'something went wrong' })
  }

  async #authenticate({ req, next }: HandlerArguments<Params, Values>) {
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split(' ')[1]

    if (!accessToken) {
      throw new AuthError('access token missing', 401)
    }

    let decodedToken

    try {
      decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'invalid access token'

      throw new AuthError(message, 401)
    }

    const { success, data } = tokenSchema.safeParse(decodedToken)

    if (!success) {
      throw new AuthError('malformed access token', 401)
    }

    if (!(await User.exists({ _id: data.userId }))) {
      throw new AuthError('user does not exist', 404)
    }

    req.userId = data.userId
    next()
  }

  authenticate() {
    return new Handler({
      middlewares: [...this.#middlewares, this.#authenticate],
      paramsSchema: this.#paramsSchema,
      valuesSchema: this.#valuesSchema,
    })
  }

  params<T extends Params>(schema: z.Schema<T>) {
    return new Handler({
      paramsSchema: schema,
      valuesSchema: this.#valuesSchema,
      middlewares: this.#middlewares,
    })
  }

  values<T extends Values>(schema: z.Schema<T>) {
    return new Handler({
      valuesSchema: schema,
      paramsSchema: this.#paramsSchema,
      middlewares: this.#middlewares,
    })
  }

  execute(callback: HandlerFunction<Params, Values>): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const params = this.#validateParams(req.params)

        if (req.file || req.files) {
          await this.#upload(req)
        }

        const values = this.#validateValues(req.body)

        const args = {
          req,
          params,
          res,
          values,
          next,
        } satisfies HandlerArguments<Params, Values>

        await this.#executeMiddlewares(args)
        await callback(args)
      } catch (error) {
        this.#handleError({ error, res })
      }
    }
  }
}

export const handler = new Handler()
