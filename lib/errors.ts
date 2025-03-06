type Type = 'ACTION' | 'QUERY'

type Identifier = `${Uppercase<string>}_${Type}_ERROR`

export class HandlerError extends Error {
  public status: number
  public identifier: Identifier

  constructor(message: string, status: number, identifier: Identifier) {
    super(message)
    this.status = status
    this.identifier = identifier
  }
}
