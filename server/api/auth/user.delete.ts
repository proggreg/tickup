export default defineEventHandler(async (event) => {
  const query = await getQuery(event)
  
  if (!query.username) {
    throw createError({
      statusCode: 400,
      message: 'Username is required'
    })
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