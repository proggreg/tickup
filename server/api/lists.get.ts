import { getToken, getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  try {
    console.log('get lists')
    const query = getQuery(event)
    console.log('query id', query.id)


    return await ListSchema.find({ userId: query.id })
  } catch (error) {
    return error
  }
})
