import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import type { Request } from 'express'

import { AuthError } from '../lib/errors'
import { tokenSchema } from '../lib/validation'
import { User } from '../models/user'

export const authenticate = async (req: Request) => {
  const authHeader = req.headers.authorization
  const accessToken = authHeader?.split(' ')[1]

  if (!accessToken) {
    throw new AuthError('access token missing', 401)
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'invalid access token'

    throw new AuthError(message, 401)
  }

  const { success, data } = tokenSchema.safeParse(decodedToken)

  if (!success) {
    throw new AuthError('malformed access token', 401)
  }

  if (!(await User.exists({ _id: data.userId }))) {
    throw new AuthError('user does not exist', 404)
  }

  const userObjectId = new Types.ObjectId(data.userId)

  return userObjectId
}
