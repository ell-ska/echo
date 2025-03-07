import { z } from 'zod'

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
}
