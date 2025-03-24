import { InferSchemaType, model, Schema, Types } from 'mongoose'

import { imageSchema } from '../schemas/image'
import { z } from 'zod'

const sealValidation = {
  validator: () => {
    const schema = z
      .object({
        sealedAt: z.date().optional(),
        openDate: z.date().optional(),
      })
      .refine((data) => {
        return (
          (data.sealedAt && data.openDate) || (!data.sealedAt && !data.openDate)
        )
      })

    const { success } = schema.safeParse(this)
    return success
  },
  message: 'document must have either both sealedAt and openDate, or neither',
}

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sealedAt: {
      type: Date,
      validate: sealValidation,
    },
    openDate: {
      type: Date,
      validate: sealValidation,
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
  if (!this.openDate) return 'unsealed'
  if (this.openDate && this.openDate >= new Date()) return 'sealed'
  if (this.openDate && this.openDate <= new Date()) return 'opened'
})

schema.method('isSentBy', function (userId: Types.ObjectId) {
  return this.senders.includes(userId)
})

schema.method('isReceivedBy', function (userId: Types.ObjectId) {
  return this.receivers.includes(userId)
})

schema.pre('save', function (next) {
  if (!this.isModified('openDate')) {
    next()
    return
  }

  this.sealedAt = new Date()
  next()
})

type CapsuleMethods = {
  getState: () => 'unsealed' | 'sealed' | 'opened'
  isSentBy: (userId: Types.ObjectId) => boolean
  isReceivedBy: (userId: Types.ObjectId) => boolean
}
type CapsuleSchema = InferSchemaType<typeof schema>

export const Capsule = model<CapsuleSchema & CapsuleMethods>('Capsule', schema)
