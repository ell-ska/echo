import { Schema, Types } from 'mongoose'
import { z } from 'zod'

export const imageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    accessibleBy: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      required: true,
      validate: {
        validator(accessibleBy: unknown) {
          const schema = z.array(z.string().uuid()).min(1)
          const { success } = schema.safeParse(accessibleBy)
          return success
        },
        message: 'the image must be accessible by at least one user',
      },
    },
  },
  {
    timestamps: true,
  },
)
