import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import type { Types } from 'mongoose'

import { handle } from '../lib/handler'
import {
  imageSchema,
  passwordSchema,
  tokenSchema,
  usernameSchema,
} from '../lib/validation'
import { User } from '../models/user'
import { AuthError, HandlerError } from '../lib/errors'
import { RefreshToken } from '../models/refresh-token'

const tokenResponse = async ({
  userId,
  res,
}: {
  userId: Types.ObjectId | string
  res: Response
}) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
  })

  await RefreshToken.insertOne({ token: refreshToken })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  res.status(200).json({ accessToken })
}

export const authController = {
  register: handle(
    async ({
      res,
      values: { username, firstName, lastName, email, password, image },
    }) => {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })
      if (existingUser) {
        throw new HandlerError('email or username already in use', 400)
      }

      await User.create({
        username,
        firstName,
        lastName,
        email,
        password,
        image: image ? { ...image, visibility: 'public' } : undefined,
      })

      res.status(201).json({ message: 'user registered successfully' })
    },
    {
      schemas: {
        values: z.object({
          username: usernameSchema,
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          password: passwordSchema,
          image: imageSchema.optional(),
        }),
      },
    },
  ),
  login: handle(
    async ({ res, values: { email, username, password } }) => {
      const user = await User.findOne(
        {
          $or: [{ username }, { email }],
        },
        '+password',
      )

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HandlerError('wrong email, username or password', 400)
      }

      await tokenResponse({ userId: user._id, res })
    },
    {
      schemas: {
        values: z
          .object({
            username: z.string().optional(),
            email: z.string().email().optional(),
            password: z.string(),
          })
          .refine(({ username, email }) => username || email, {
            message: 'either username or email must be provided',
          }),
      },
    },
  ),
  logout: handle(
    ({ res }) => {
      res.clearCookie('refreshToken', { httpOnly: true, secure: true })
      res.status(200).json({ message: 'logged out' })
    },
    { authenticate: true },
  ),
  refreshToken: handle(
    async ({ res, cookies: { refreshToken } }) => {
      if (!(await RefreshToken.exists({ token: refreshToken }))) {
        throw new AuthError('invalid or expired refresh token', 401)
      }

      let decodedToken

      try {
        decodedToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!,
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'invalid refresh token'

        throw new AuthError(message, 401)
      }

      const { success, data } = tokenSchema.safeParse(decodedToken)

      if (!success) {
        throw new AuthError('malformed refresh token', 401)
      }

      await RefreshToken.findOneAndDelete({ token: refreshToken })

      await tokenResponse({ userId: data.userId, res })
    },
    { schemas: { cookies: z.object({ refreshToken: z.string() }) } },
  ),
}
