import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import type { Types } from 'mongoose'

import { loginActionSchema, registerActionSchema } from '@repo/validation'
import { handle } from '../lib/handler'
import { tokenSchema } from '../lib/validation'
import { User } from '../models/user'
import { AuthError, HandlerError } from '../lib/errors'
import { RefreshToken } from '../models/refresh-token'

const tokenResponse = async ({
  userId,
  res,
  status = 200,
}: {
  userId: Types.ObjectId | string
  res: Response
  status?: 200 | 201
}) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d',
  })

  const databaseRefreshToken = new RefreshToken({ token: refreshToken })

  await databaseRefreshToken.save()
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  res.status(status).json({ accessToken })
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

      const user = new User({
        username,
        firstName,
        lastName,
        email,
        password,
        image,
      })

      await user.save()
      await tokenResponse({ userId: user._id, res, status: 201 })
    },
    {
      schemas: {
        values: registerActionSchema,
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
        values: loginActionSchema,
      },
    },
  ),
  logout: handle(
    async ({ res, cookies: { refreshToken } }) => {
      if (!(await RefreshToken.exists({ token: refreshToken }))) {
        throw new AuthError('invalid or expired refresh token', 401)
      }

      await RefreshToken.findOneAndDelete({ token: refreshToken })
      res.clearCookie('refreshToken', { httpOnly: true, secure: true })

      res.status(204).send()
    },
    {
      authentication: 'required',
      schemas: { cookies: z.object({ refreshToken: z.string() }) },
    },
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
