import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  console.log('check github')

  if (!token) {
    console.log('no token')
  }

  // Check if it's your specific account
  const ALLOWED_USER = process.env.ADMIN_USER_ID
  return token && token.sub === ALLOWED_USER
})
