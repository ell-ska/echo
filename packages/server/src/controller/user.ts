import { z } from 'zod'

import { handle } from '../lib/handler'
import { imageSchema, objectIdSchema, usernameSchema } from '../lib/validation'
import { User } from '../models/user'
import { HandlerError, NotFoundError } from '../lib/errors'
import { deleteFile } from '../lib/file'
import { onlyDefinedValues } from '../lib/only-defined-values'

export const userController = {
  getUserById: handle(
    async ({ res, params: { id } }) => {
      const user = await User.findById(id)

      if (!user) {
        throw new NotFoundError('user not found')
      }

      res.status(200).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      })
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
      const user = (await User.findById(userId))!

      res.status(200).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    },
    { authentication: 'required' },
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

      user.set(
        onlyDefinedValues({
          username,
          firstName,
          lastName,
          image,
        }),
      )

      await user.save()
      res.status(204).send()
    },
    {
      authentication: 'required',
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
    { authentication: 'required' },
  ),
}
