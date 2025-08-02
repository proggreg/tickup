export default defineEventHandler(async (event) => {
  try {
    const { listId } = getQuery(event)
    if (listId) {
      const todos = await TodoSchema.find({ listId })
      return todos
    }
  }
  catch (e) {
    return e
  }
})
