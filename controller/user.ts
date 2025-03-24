import { z } from 'zod'

import { handle } from '../lib/handler'
import { imageSchema, objectIdSchema, usernameSchema } from '../lib/validation'
import { User } from '../models/user'
import { HandlerError, NotFoundError } from '../lib/errors'
import { deleteFile } from '../lib/file'

export const userController = {
  getUserById: handle(
    async ({ res, params: { id } }) => {
      const user = await User.findById(id, 'username firstName lastName image')

      if (!user) {
        throw new NotFoundError('user not found')
      }

      res.status(200).json(user)
    },
    {
      schemas: {
        params: z.object({
          id: objectIdSchema,
        }),
      },
    },
  ),
  getCurrentUser: handle(
    async ({ res, userId }) => {
      const user = await User.findById(
        userId,
        'username firstName lastName image email',
      )

      if (!user) {
        throw new NotFoundError('user not found')
      }

      res.status(200).json(user)
    },
    { authenticate: true },
  ),
  editUser: handle(
    async ({
      res,
      values: { username, firstName, lastName, image },
      userId,
    }) => {
      const userWithWantedUsername = await User.findOne({ username })
      if (userWithWantedUsername) {
        throw new HandlerError('username taken', 400)
      }

      const user = (await User.findById(userId))!
      const oldImage = user.image

      if (oldImage) {
        await deleteFile(oldImage.name)
      }

      await user.updateOne({
        username,
        firstName,
        lastName,
        image,
      })

      res.status(204).send()
    },
    {
      authenticate: true,
      schemas: {
        values: z.object({
          username: usernameSchema.optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          image: imageSchema.optional(),
        }),
      },
    },
  ),
  deleteUser: handle(
    async ({ res, userId }) => {
      const user = (await User.findById(userId))!

      if (user.image) {
        await deleteFile(user.image.name)
      }

      await user.deleteOne()

      res.status(204).send()
    },
    { authenticate: true },
  ),
}
