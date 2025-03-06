import z from 'zod'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

import { HandlerError } from './errors'

class Handler<Values extends unknown | null, Params extends unknown | null> {
  #valuesSchema = null as z.Schema<Values> | null
  #paramsSchema = null as z.Schema<Params> | null

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

  async #builder({
    callback,
    ...args
  }: {
    req: Request
    params: Params
    res: Response
    next: NextFunction
    values: Values
    callback: (args: {
      req: Request
      params: Params
      res: Response
      next: NextFunction
      values: Values
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

  params<T extends Params>(schema: z.Schema<T>) {
    this.#paramsSchema = schema
    return this as unknown as Handler<Values, z.infer<typeof schema>>
  }

  values<T extends Values>(schema: z.Schema<T>) {
    this.#valuesSchema = schema
    return this as unknown as Handler<z.infer<typeof schema>, Params>
  }

  action(
    callback: (args: {
      req: Request
      params: Params
      res: Response
      values: Values
      next: NextFunction
    }) => Promise<void>,
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const params = this.#validateParams(req, res)
      if (params === undefined) return

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

  query(
    callback: (args: {
      req: Request
      params: Params
      res: Response
      next: NextFunction
    }) => Promise<void>,
  ): RequestHandler {
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
