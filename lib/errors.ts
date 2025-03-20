import type { ZodError } from 'zod'
import type { Response } from 'express'

import { logger, type Identifier } from './logger'

export class NotFoundError extends Error {
  public status = 404

  constructor(message: string) {
    super(message)
  }
}

export class HandlerError extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class ValidationError {
  public status = 400
  public message: {
    _errors: string[]
  }

  constructor(error: ZodError) {
    this.message = error.format()
  }
}

export class AuthError extends Error {
  public status: 401 | 403 | 404

  constructor(message: string, status: 401 | 403 | 404) {
    super(message)
    this.status = status
  }
}

export class UnexpectedError extends Error {
  public status: number
  public identifier: Identifier
  public publicMessage: string

  constructor(
    privateMessage: string,
    publicMessage: string,
    status: number,
    identifier: Identifier,
  ) {
    super(privateMessage)
    this.publicMessage = publicMessage
    this.status = status
    this.identifier = identifier
  }
}

export const handleError = ({
  error,
  res,
}: {
  error: unknown
  res: Response
}) => {
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
    return res.status(error.status).json({ error: error.publicMessage })
  }

  logger.error({
    identifier: 'handler_unknown',
    message: error instanceof Error ? error.message : 'unknown error',
  })
  return res.status(500).json({ error: 'something went wrong' })
}
