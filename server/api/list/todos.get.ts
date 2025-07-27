export default defineEventHandler(async (event) => {
  try {
    const { listId } = getQuery(event)
    if (listId) {
      // console.log(`get list ${listId} todos`)
      const todos = await TodoSchema.find({ listId })
      // console.log('get list todos', { query, todos })
      // console.log('get list todos', todos)
      return todos
    }
  }
  catch (e) {
    return e
  }
})
