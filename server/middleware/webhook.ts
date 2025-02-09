import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    if (event.path.startsWith('/api/webhook/')) {
        console.log(`[Webhook] Request received for path: ${event.path}`)
    }

    if (event.path.startsWith('/api/webhook/')) {
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
