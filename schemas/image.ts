import { Schema, Types } from 'mongoose'

export const imageSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    accessibleBy: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
)
