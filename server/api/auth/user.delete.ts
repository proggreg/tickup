import { UserSchema } from '../../models/users.schema'

export default defineEventHandler(async (event) => {
  const query = await getQuery(event)
  const body = await readBody(event)
  
  if (!query.username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required'
    })
  }

  // If pushSubscription is provided, remove it from the user's pushSubscriptions
  if (body.pushSubscription && body.username) {
    return await UserSchema.findOneAndUpdate(
      { username: body.username },
      { $pull: { pushSubscriptions: body.pushSubscription } },
      { new: true }
    )
  }

  try {
    const result = await UserSchema.deleteOne({ username: query.username })
    
    if (result.deletedCount > 0) {
      return { message: 'User deleted successfully' }
    } else {
      return { message: 'User not found' }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to delete user'
    })
  }
}) 