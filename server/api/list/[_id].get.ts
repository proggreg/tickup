export default defineEventHandler(async (event) => {
  try {
    const listId = event.context.params?._id

    if (!listId) {
      throw createError({
        statusCode: 400,
        message: 'List ID is required',
      })
    }

    const list = await ListSchema.findById(listId)

    if (!list) {
      throw createError({
        statusCode: 404,
        message: 'List not found',
      })
    }

    const listTodos = await TodoSchema.find({ listId: list._id }).sort({ order: 1 })

    // Return list with todos embedded for compatibility with existing frontend code
    return { ...list.toObject(), todos: listTodos }
  }
  catch (error: any) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }

    logger.error(error, { component: 'ListAPI', function: 'getList', listId: event.context.params?._id })
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch list',
    })
  }
})
