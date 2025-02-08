export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const lists = await ListSchema.find({ userId: query.id })

    // console.log('get lists', lists)
    return lists
  }
  catch (error) {
    return error
  }
})
