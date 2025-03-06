import { InferSchemaType, model, Schema } from 'mongoose'

import { imageSchema } from '../schemas/image'

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lockedAt: {
      type: Date,
    },
    unlockDate: {
      type: Date,
    },
    showCountdown: {
      type: Boolean,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
    },
    content: {
      type: String,
    },
    images: [imageSchema],
    senders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    receivers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const Capsule = model<InferSchemaType<typeof schema>>('Capsule', schema)
