import { InferSchemaType, model, MongooseError, Schema } from 'mongoose'
import { z } from 'zod'
import bcrypt from 'bcrypt'

import { imageSchema } from '../schemas/image'
import { logger } from '../lib/logger'

const schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [
        (email: unknown) => {
          const schema = z.string().email()
          const { success } = schema.safeParse(email)
          return success
        },
      ],
    },
    image: imageSchema,
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
)

schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword

    next()
  } catch (error) {
    if (error instanceof MongooseError) {
      next(error)
    }

    if (error instanceof Error) {
      logger.error({
        identifier: 'database_hash_password',
        message: error.message,
      })

      throw error
    }
  }
})

export const User = model<InferSchemaType<typeof schema>>('User', schema)
