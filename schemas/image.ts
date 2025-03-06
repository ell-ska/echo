import { Schema } from 'mongoose'

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
  },
  {
    timestamps: true,
  },
)
