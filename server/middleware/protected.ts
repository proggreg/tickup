import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const isProtected = event.path.startsWith('/api/webhook/') || (event.path.startsWith('/api/github') && !event.path.startsWith('/api/github/check'))
  if (isProtected) {
    console.log(`[Webhook] Request received for path: ${event.path}`)
  }

  if (isProtected) {
    const session = await getServerSession(event)
    const sub = session?.user.sub
    if (!sub) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Check if it's your specific account
    const ALLOWED_USER = process.env.ADMIN_USER_ID // or process.env.ADMIN_EMAIL
    if (sub !== ALLOWED_USER) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Access restricted',
      })
    }
  }
})
