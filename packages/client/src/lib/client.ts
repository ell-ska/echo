import axios from 'axios'
import { auth } from './auth'

export const client = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use(
  async (request) => {
    const accessToken = auth.getAccessToken()

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return request
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        await auth.refresh()
        return client(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
