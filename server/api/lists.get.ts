import { getToken, getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  try {
    const token = await getToken({ event })
    const session = await getServerSession(event)
    const id = session.user._id ? session.user._id : token.sub

    return await ListSchema.find({ userId: id })
  } catch (error) {
    return error
  }
})
