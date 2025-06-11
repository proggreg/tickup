import webpush from 'web-push'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const subscription = body.subscription

  console.log('subscription', subscription)
  console.log('NUXT_ENV_VAPID_PUBLIC_KEY', process.env.NUXT_ENV_VAPID_PUBLIC_KEY)

  const vapidPrivateKey = process.env.NUXT_ENV_VAPID_PRIVATE_KEY

  if (!vapidPrivateKey) {
    throw new Error('VAPID private key is not defined in environment variables.')
  }

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    process.env.NUXT_ENV_VAPID_PUBLIC_KEY || '',
    vapidPrivateKey
  )

  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: 'Hello Push!',
      message: 'Your push notification is working!',
    }))
    console.log('Push notification sent successfully!')
    return { success: true }
  }
  catch (error) {
    console.error('Error sending push notification:', error)
    throw error
  }
})