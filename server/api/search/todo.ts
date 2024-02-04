export default defineEventHandler(async (event) => {
  try {
    const {q} = getQuery(event)

    return await TodoSchema.find({ name: { $regex: q, $options: 'i' } })
  } catch (error) {
    return error
  }
})
