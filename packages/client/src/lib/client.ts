import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: { 'Content-Type': 'application/json' },
})
