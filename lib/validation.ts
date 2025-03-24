import { z } from 'zod'
import { Types } from 'mongoose'

import { ValidationError } from './errors'

export const passwordSchema = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .max(20, 'password cannot be longer than 20 characters')
  .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'password must contain at least one lowercase letter')
  .regex(/\d/, 'password must contain at least one digit')
  .regex(/[!@#$%^&*]/, 'password must contain at least one special character')

export const usernameSchema = z
  .string()
  .min(3, 'username must be at least 3 characters')
  .max(30, 'username cannot be longer than 30 characters')

export const imageSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
})

export const tokenSchema = z.object({
  userId: z.string(),
})

// preprocess sets the output type to unknown, hence the type assertion

export const objectIdSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && Types.ObjectId.isValid(value)
      ? new Types.ObjectId(value)
      : value,
  z.instanceof(Types.ObjectId),
) as z.ZodEffects<
  z.ZodType<Types.ObjectId, z.ZodTypeDef, Types.ObjectId>,
  Types.ObjectId,
  Types.ObjectId
>

export const multipartFormBoolean = z.preprocess(
  (value) => (typeof value === 'string' ? value === 'true' : false),
  z.boolean(),
) as z.ZodEffects<z.ZodBoolean, boolean, unknown>

export const multipartFormObjectIdArray = z.preprocess(
  (value) => (typeof value === 'string' ? JSON.parse(value) : value),
  z.array(objectIdSchema).min(1),
) as z.ZodEffects<
  z.ZodArray<
    z.ZodEffects<
      z.ZodType<Types.ObjectId, z.ZodTypeDef, Types.ObjectId>,
      Types.ObjectId,
      Types.ObjectId
    >,
    'many'
  >,
  Types.ObjectId[],
  Types.ObjectId[]
>

export const validate = <T>(
  schema: z.Schema<T> | undefined,
  values: unknown,
): T | null => {
  if (!schema) {
    return null
  }

  const { success, error, data } = schema.safeParse(values)

  if (!success) {
    throw new ValidationError(error)
  }

  return data
}
