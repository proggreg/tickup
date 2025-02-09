export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    if (query.today) {
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return await TodoSchema.find({
        userId: query.id,
        dueDate: {
          $gte: start,
          $lt: end,
        },
      })
    }

    if (query.overdue) {
      return await TodoSchema.find({
        userId: query.id,
        dueDate: {
          $lt: start,
        },
      }).sort({ dueDate: -1 })
    }

    return await TodoSchema.find({ userId: query.id })
  }
  catch (error) {
    return []
  }
})
