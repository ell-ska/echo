import { InferSchemaType, model, Schema } from 'mongoose'
import { z } from 'zod'

import { imageSchema } from '../schemas/image'

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

export const User = model<InferSchemaType<typeof schema>>('User', schema)
