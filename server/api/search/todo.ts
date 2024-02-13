export default defineEventHandler(async (event) => {
  try {
    const { q, id } = getQuery(event)

    return await TodoSchema.find({ userId: id, name: { $regex: q, $options: 'i' } })
  } catch (error) {
    return error
  }
})
