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
  ActionError,
  AuthError,
  NotFoundError,
  UnexpectedError,
} from './errors'
import { logger } from './logger'
import { User } from '../models/user'

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

  #validateParams(req: Request, res: Response): Params | undefined {
    if (!this.#paramsSchema) {
      return null as Params
    }

    const result = this.#paramsSchema.safeParse(req.params)

    if (!result.success) {
      res.status(400).json(result.error.format())
      return
    }

    return result.data
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

  async #authenticate({ req, next }: HandlerArguments<Params, Values>) {
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split(' ')[1]

    if (!accessToken) {
      throw new AuthError('access token missing', 401)
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    )

    if (!decodedToken || typeof decodedToken === 'string') {
      throw new AuthError('access token expired', 401)
    }

    if (!(await User.exists({ _id: decodedToken.userId }))) {
      throw new AuthError('user does not exist', 401)
    }

    req.userId = decodedToken.userId
    next()
  }

  async #builder({
    callback,
    ...args
  }: {
    req: Request
    params: Params
    res: Response
    next: NextFunction
    values: Values
    callback: HandlerFunction<Params, Values>
  }) {
    try {
      await this.#executeMiddlewares(args)
      await callback(args)
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ActionError ||
        error instanceof AuthError
      ) {
        return args.res.status(error.status).json({ error: error.message })
      }

      if (error instanceof UnexpectedError) {
        logger.error({ identifier: error.identifier, message: error.message })
        return args.res.status(error.status).json({ error: error.message })
      }

      logger.error({
        identifier: 'handler_unknown',
        message: error instanceof Error ? error.message : 'unknown error',
      })
      return args.res.status(500).json({ error: 'something went wrong' })
    }
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

  action(callback: HandlerFunction<Params, Values>): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const params = this.#validateParams(req, res)
      if (params === undefined) return

      if (req.file || req.files) {
        await this.#upload(req)
      }

      if (!this.#valuesSchema) {
        this.#builder({
          req,
          params,
          res,
          next,
          values: null as Values,
          callback,
        })
        return
      }

      const result = this.#valuesSchema.safeParse(req.body)

      if (!result.success) {
        res.status(400).json(result.error.format())
        return
      }

      this.#builder({
        req,
        params,
        res,
        next,
        values: result.data,
        callback,
      })
    }
  }

  query(callback: HandlerFunction<Params, Values>): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const params = this.#validateParams(req, res)
      if (params === undefined) return

      this.#builder({
        req,
        params,
        res,
        next,
        values: null as Values,
        callback,
      })
    }
  }
}

export const handler = new Handler()
