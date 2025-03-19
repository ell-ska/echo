import { Schema, Types } from 'mongoose'
import { z } from 'zod'

import { objectIdSchema } from '../lib/validation'

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
    visibility: {
      type: String,
      enum: ['public', 'private'],
      required: true,
      default: 'private',
    },
    accessibleBy: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator(accessibleBy: unknown) {
          if (!('visibility' in this)) {
            return false
          }

          if (this.visibility === 'private') {
            const schema = z.array(objectIdSchema).min(1)
            const { success } = schema.safeParse(accessibleBy)
            return success
          }

          if (this.visibility === 'public') {
            const schema = z.tuple([])
            const { success } = schema.safeParse(accessibleBy)
            return success
          }
        },
        message:
          'private images must be accessible by at least one user, public images should not have an accessible by list',
      },
    },
  },
  {
    timestamps: true,
  },
)
