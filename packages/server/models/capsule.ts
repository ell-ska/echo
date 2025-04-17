import { Document, InferSchemaType, model, Schema, Types } from 'mongoose'

import { imageSchema } from '../schemas/image'

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sealedAt: {
      type: Date,
    },
    openDate: {
      type: Date,
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

schema.virtual('state').get(function () {
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
  isSentBy: (userId: Types.ObjectId) => boolean
  isReceivedBy: (userId: Types.ObjectId) => boolean
}
type CapsuleSchema = InferSchemaType<typeof schema> & {
  state: 'unsealed' | 'opened' | 'sealed'
}

export const Capsule = model<CapsuleSchema & CapsuleMethods>('Capsule', schema)
export type TCapsule = CapsuleSchema & Document
