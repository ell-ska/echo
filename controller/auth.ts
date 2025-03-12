import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { handler } from '../lib/handler'
import { passwordSchema, usernameSchema } from '../lib/validation'
import { User } from '../models/user'
import { ActionError } from '../lib/errors'

export const authController = {
  // TODO: add image
  register: handler
    .values(
      z.object({
        username: usernameSchema,
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        password: passwordSchema,
      }),
    )
    .action(
      async ({
        res,
        values: { username, firstName, lastName, email, password },
      }) => {
        const existingUser = await User.findOne({
          $or: [{ email }, { username }],
        })
        if (existingUser) {
          throw new ActionError('email or username already in use', 400)
        }

        await User.create({
          username,
          firstName,
          lastName,
          email,
          password,
        })

        res.status(201).json({ message: 'user registered successfully' })
      },
    ),
  login: handler
    .values(
      z
        .object({
          username: z.string().optional(),
          email: z.string().email().optional(),
          password: z.string(),
        })
        .refine(({ username, email }) => username || email, {
          message: 'either username or email must be provided',
        }),
    )
    .action(async ({ res, values: { email, username, password } }) => {
      const user = await User.findOne(
        {
          $or: [{ username }, { email }],
        },
        '+password',
      )

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ActionError('wrong username or password', 400)
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '1h' },
      )
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET!,
      )

      res.status(200).json({ accessToken, refreshToken })
    }),
}
