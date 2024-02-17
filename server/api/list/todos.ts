export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    if (query.id) {
      return await TodoSchema.find({ listId: query.id})
    }
  } catch(e) {
    return e
  }
})