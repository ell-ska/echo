import mongoose from 'mongoose'

import { logger } from './lib/logger'

export const db = {
  connect: async () => {
    try {
      const uri = process.env.DB_URI!
      await mongoose.connect(uri)
    } catch (error) {
      if (error instanceof Error) {
        logger.error({
          identifier: 'database_connection',
          message: error.message,
        })
      }
    }
  },
}
