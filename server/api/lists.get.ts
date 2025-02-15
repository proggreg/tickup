export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    return await ListSchema.find({ userId: query.id })
  }
  catch (error) {
    return error
  }
})
