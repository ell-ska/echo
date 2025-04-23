import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import type { Request } from 'express'

import { AuthError } from '../lib/errors'
import { tokenSchema } from '../lib/validation'
import { User } from '../models/user'

const handleError = (error: AuthError, shouldThrow: boolean) => {
  if (shouldThrow) {
    throw error
  }

  return null
}

export const authenticate = async (req: Request, shouldThrow: boolean) => {
  const authHeader = req.headers.authorization
  const accessToken = authHeader?.split(' ')[1]

  if (!accessToken) {
    return handleError(new AuthError('access token missing', 401), shouldThrow)
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'invalid access token'

    return handleError(new AuthError(message, 401), shouldThrow)
  }

  const { success, data } = tokenSchema.safeParse(decodedToken)

  if (!success) {
    return handleError(
      new AuthError('malformed access token', 401),
      shouldThrow,
    )
  }

  if (!(await User.exists({ _id: data.userId }))) {
    return handleError(new AuthError('user does not exist', 404), shouldThrow)
  }

  const userObjectId = new Types.ObjectId(data.userId)

  return userObjectId
}
