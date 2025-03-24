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

schema.method('getState', function () {
  if (!this.unlockDate) return 'unsealed'
  if (this.unlockDate && this.unlockDate >= new Date()) return 'sealed'
  if (this.unlockDate && this.unlockDate <= new Date()) return 'opened'
})

schema.method('isSentBy', function (userId: Types.ObjectId) {
  return this.senders.includes(userId)
})

schema.method('isReceivedBy', function (userId: Types.ObjectId) {
  return this.receivers.includes(userId)
})

schema.pre('save', function (next) {
  if (!this.isModified('unlockDate')) {
    next()
    return
  }

  this.lockedAt = new Date()
  next()
})

type CapsuleMethods = {
  getState: () => 'unsealed' | 'sealed' | 'opened'
  isSentBy: (userId: Types.ObjectId) => boolean
  isReceivedBy: (userId: Types.ObjectId) => boolean
}
type CapsuleSchema = InferSchemaType<typeof schema>

export const Capsule = model<CapsuleSchema & CapsuleMethods>('Capsule', schema)
