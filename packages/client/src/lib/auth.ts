import {
  type RegisterValues,
  type LoginValues,
  tokenResponseSchema,
  userResponseSchema,
} from '@repo/validation'
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

  private async fetchTokens(
    path: '/log-in' | '/register',
    values: LoginValues | RegisterValues
  ) {
    const response = await client.post(`/auth${path}`, values)

    const { accessToken } = tokenResponseSchema.parse(response.data)
    this.setAccessToken(accessToken)
  }

  async register(values: RegisterValues) {
    await this.fetchTokens('/register', values)
  }

  async logIn(values: LoginValues) {
    await this.fetchTokens('/log-in', values)
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

  async getCurrentUser() {
    try {
      const response = await client.get('/users/me')

      const { data, error } = userResponseSchema.safeParse(response.data)

      if (error) {
        return null
      }

      return data
    } catch {
      return null
    }
  }
}

export const auth = new Auth()
