import type { CapsuleData, UserData } from '@repo/validation/data'

export const isSender = (
  userId: UserData['_id'],
  senders: CapsuleData['senders']
) => {
  return senders.some((sender) => sender._id === userId)
}
