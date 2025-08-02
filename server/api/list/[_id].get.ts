export default defineEventHandler(async (event) => {
  try {
    const list = await ListSchema.findById({ _id: event.context.params?._id })

    if (!list) {
      return {
        statusCode: 404,
        message: 'List not found',
      }
    }
    const listTodos = await TodoSchema.find({ listId: list._id }).sort({ order: 1 })
    
    return { list, listTodos }
  }
  catch (error) {
    return error
  }
})
