import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  if (event.path.startsWith('/api/aws/')) {
    const token = await getToken({ event })
    const session = await getServerSession(event)

    console.log('session', session)

    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Check if it's your specific account
    const ALLOWED_USER = process.env.ADMIN_USER_ID // or process.env.ADMIN_EMAIL
    if (token.sub !== ALLOWED_USER) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Access restricted',
      })
    }
  }
})
