import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  const session = await getServerSession(event)
  const sub = session?.user.sub

  if (!token) {
    console.debug('no token')
  }

  const ALLOWED_USER = process.env.ADMIN_USER_ID
  return sub === ALLOWED_USER
})
