import { UserSchema } from '../../models/users.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username || !body.pushSubscription) {
    return { error: 'username and pushSubscription are required' }
  }

  const updatedUser = await UserSchema.findOneAndUpdate(
    { username: body.username },
    { $addToSet: { pushSubscriptions: body.pushSubscription } },
    { new: true }
  )

  if (!updatedUser) {
    return { error: 'User not found' }
  }

  return {
    _id: updatedUser._id.toString(),
    username: updatedUser.username,
    pushSubscriptions: updatedUser.pushSubscriptions
  }
}) 