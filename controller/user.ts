import { z } from 'zod'

import { handler } from '../lib/handler'
import { objectIdSchema } from '../lib/validation'
import { User } from '../models/user'
import { NotFoundError } from '../lib/errors'

export const userController = {
  getUserById: handler
    .params(
      z.object({
        id: objectIdSchema,
      }),
    )
    .execute(async ({ res, params: { id } }) => {
      const user = await User.findById(id, 'username firstName lastName image')

      if (!user) {
        throw new NotFoundError('user not found')
      }

      res.status(200).json(user)
    }),
}
