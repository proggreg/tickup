export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    if (query.id) {
      return await TodoSchema.find({ listId: query.id }).sort({ order: 1 });
    }
  } catch (e) {
    return e
  }
})