import { getToken } from '#auth'
export default defineEventHandler(async (event) => {
  try {
    const token = await getToken({ event })
    const id =  token.sub

    return await ListSchema.find({ userId: id })
  } catch (error) {
    return error
  }
})
