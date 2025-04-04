import { type InferSchemaType, model, Schema } from 'mongoose'

const schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
})

export const RefreshToken = model<InferSchemaType<typeof schema>>(
  'RefreshToken',
  schema,
)
