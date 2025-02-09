import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const isProtected = event.path.startsWith('/api/webhook/') || (event.path.startsWith('/api/github') && !event.path.startsWith('/api/github/check'))
  if (isProtected) {
    console.log(`[Webhook] Request received for path: ${event.path}`)
  }

  if (isProtected) {
    const token = await getToken({ event })

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
