import { type LoginValues } from '@repo/validation/actions'
import { tokenResponseSchema } from '@repo/validation/data'
import { client } from './client'

class Auth {
  private accessToken: string | null = null
  private isRefetching = false

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken
  }

  getAccessToken() {
    return this.accessToken
  }

  async logIn(values: LoginValues) {
    const response = await client.post('/auth/log-in', values)

    const { accessToken } = tokenResponseSchema.parse(response.data)
    this.setAccessToken(accessToken)
  }

  async logOut() {
    this.accessToken = null
    await client.delete('/auth/log-out')
  }

  async refresh() {
    if (this.isRefetching) return
    this.isRefetching = true

    try {
      const response = await client.post('/auth/token/refresh')

      const { accessToken } = tokenResponseSchema.parse(response.data)
      this.accessToken = accessToken
    } catch {
      this.accessToken = null
    } finally {
      this.isRefetching = false
    }
  }
}

export const auth = new Auth()
