import type { RegisterValues, LoginValues } from '@repo/validation/actions'
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

  private async fetch(
    path: '/log-in' | '/register',
    values: LoginValues | RegisterValues
  ) {
    const response = await client.post(`/auth${path}`, values)

    const { accessToken } = tokenResponseSchema.parse(response.data)
    this.setAccessToken(accessToken)
  }

  async register(values: RegisterValues) {
    await this.fetch('/register', values)
  }

  async logIn(values: LoginValues) {
    await this.fetch('/log-in', values)
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
