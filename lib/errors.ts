import type { Identifier } from './logger'

export class NotFoundError extends Error {
  public status = 404

  constructor(message: string) {
    super(message)
  }
}

export class ValidationError extends Error {
  public status = 400

  constructor(message: string) {
    super(message)
  }
}

export class AuthError extends Error {
  public status: 401 | 403

  constructor(message: string, status: 401 | 403) {
    super(message)
    this.status = status
  }
}

export class UnexpectedError extends Error {
  public status: number
  public identifier: Identifier

  constructor(message: string, status: number, identifier: Identifier) {
    super(message)
    this.status = status
    this.identifier = identifier
  }
}
