import { InferSchemaType, model, Schema, Types } from 'mongoose'

import { imageSchema } from '../schemas/image'
import { z } from 'zod'

const lockValidation = {
  validator: () => {
    const schema = z
      .object({
        lockedAt: z.date().optional(),
        unlockDate: z.date().optional(),
      })
      .refine((data) => {
        return (
          (data.lockedAt && data.unlockDate) ||
          (!data.lockedAt && !data.unlockDate)
        )
      })

    const { success } = schema.safeParse(this)
    return success
  },
  message: 'document must have either both lockedAt and unlockDate, or neither',
}

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lockedAt: {
      type: Date,
      validate: lockValidation,
    },
    unlockDate: {
      type: Date,
      validate: lockValidation,
    },
    showCountdown: {
      type: Boolean,
      required: true,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      required: true,
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

schema.method('isUnlocked', function () {
  return this.unlockDate && this.unlockDate <= new Date()
})

schema.method('isSender', function (userId: Types.ObjectId) {
  return this.senders.includes(userId)
})

schema.method('isReceiver', function (userId: Types.ObjectId) {
  return this.receivers.includes(userId)
})

type CapsuleMethods = {
  isUnlocked: () => boolean
  isSender: (userId: Types.ObjectId) => boolean
  isReceiver: (userId: Types.ObjectId) => boolean
}
type CapsuleSchema = InferSchemaType<typeof schema>

export const Capsule = model<CapsuleSchema & CapsuleMethods>('Capsule', schema)
