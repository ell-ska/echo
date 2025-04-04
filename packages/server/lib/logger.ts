type Scope = 'handler' | 'database' | 'server'
export type Identifier = `${Scope}_${Lowercase<string>}`

type Parameter = { identifier: Identifier; message: string }

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
}

export const logger = {
  error: ({ identifier, message }: Parameter) => {
    console.error(
      `${colors.red}[${identifier}_error]${colors.reset}: ${message}`,
    )
  },
  information: ({ identifier, message }: Parameter) => {
    console.log(
      `${colors.green}[${identifier}_information]${colors.reset}: ${message}`,
    )
  },
}
