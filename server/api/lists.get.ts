import { getToken, getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  try {
    const token = await getToken({ event })
    const session = await getServerSession(event)
    console.log('token', token)
    console.log('session id', session.user._id)
    // return token || 'no token present'

    return await ListSchema.find({ userId: session.user._id })
  } catch (error) {
    return error
  }
})
