import z from 'zod'
import type { NextFunction, Request, Response } from 'express'

import { HandlerError } from './errors'

class Handler<
  Values extends unknown | null,
  InputParams extends string[] | null,
  OutputParams extends { [key: string]: string } | null,
> {
  #schema = null as z.Schema<Values> | null
  #params = null as InputParams

  #validateParams<T extends InputParams>(
    params: T,
    req: Request,
    res: Response,
  ): OutputParams {
    if (!params) {
      return null as OutputParams
    }

    const schema = z.object(
      Object.fromEntries(params.map((params) => [params, z.string()])),
    )
    const result = schema.safeParse(req.params)

    if (!result.success) {
      res.status(400).json(result.error.format())
      return null as OutputParams
    }

    return result.data as NonNullable<OutputParams>
  }

  async #builder({
    callback,
    ...args
  }: {
    req: Request
    params: OutputParams
    res: Response
    next: NextFunction
    values: Values
    callback: (args: {
      req: Request
      params: OutputParams
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

  params<T extends NonNullable<InputParams>>(params: T) {
    this.#params = params
    return this as unknown as Handler<
      Values,
      typeof params,
      { [K in T[number]]: string }
    >
  }

  schema<T extends Values>(schema: z.Schema<T>) {
    this.#schema = schema
    return this as unknown as Handler<
      z.infer<typeof schema>,
      InputParams,
      OutputParams
    >
  }

  action(
    callback: (args: {
      req: Request
      params: OutputParams
      res: Response
      values: Values
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

      this.#builder({
        req,
        params: this.#validateParams(this.#params, req, res),
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
      params: OutputParams
      res: Response
      next: NextFunction
    }) => Promise<void>,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      this.#builder({
        req,
        params: this.#validateParams(this.#params, req, res),
        res,
        next,
        values: {} as Values,
        callback,
      })
    }
  }
}

export const handler = new Handler()
