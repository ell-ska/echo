import z from 'zod'
import type { NextFunction, Request, Response } from 'express'

import { HandlerError } from './errors'

class Handler<T = unknown> {
  #schema?: z.Schema<T>

  private async handleCallback({
    callback,
    ...args
  }: {
    req: Request
    res: Response
    next: NextFunction
    values: T
    callback: (args: {
      req: Request
      res: Response
      next: NextFunction
      values: T
    }) => Promise<void>
  }) {
    try {
      await callback(args)
    } catch (error) {
      if (error instanceof HandlerError) {
        // TODO: log the error with the identifier
        return args.res.status(error.status).json({ error: error.message })
      }

      return args.res.status(500).json({ error: 'something went wrong' })
    }
  }

  schema<U extends T>(schema: z.Schema<U>) {
    this.#schema = schema
    return this as unknown as Handler<z.infer<typeof schema>>
  }

  action(
    callback: ({
      values,
      req,
      res,
      next,
    }: {
      values: T
      req: Request
      res: Response
      next: NextFunction
    }) => Promise<void>,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.#schema) {
        throw new Error('no schema provided')
      }

      const result = this.#schema.safeParse(req.body)

      if (!result.success) {
        return res.status(400).json(result.error.format())
      }

      this.handleCallback({ req, res, next, values: result.data, callback })
    }
  }

  query(
    callback: ({
      req,
      res,
      next,
    }: {
      req: Request
      res: Response
      next: NextFunction
    }) => Promise<void>,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      this.handleCallback({ req, res, next, values: {} as T, callback })
    }
  }
}

export const handler = new Handler()
