import type { Identifier } from './logger'

export class HandlerError extends Error {
  public status: number
  public identifier: Identifier

  constructor(message: string, status: number, identifier: Identifier) {
    super(message)
    this.status = status
    this.identifier = identifier
  }
}
