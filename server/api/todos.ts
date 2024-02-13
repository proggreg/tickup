export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    if (query.today) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return await TodoSchema.find({
        userId: query.id,
        dueDate: {
          $gte: start,
          $lt: end
        }
      })
    }
    return await TodoSchema.find({ userId: query.id })
  } catch (error) {
    return []
  }
})
