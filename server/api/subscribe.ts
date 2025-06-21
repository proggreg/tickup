import webpush from 'web-push'
import { readBody } from 'h3'
import { Subscriptions } from '~/server/models/subscriptions.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { subscription, userId } = body

  // Save subscription to DB (upsert by userId)
  if (userId && subscription) {
    await Subscriptions.updateOne(
      { userId },
      { $set: { subscription } },
      { upsert: true }
    )
  }

  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (!vapidPrivateKey) {
    throw new Error('VAPID private key is not defined in environment variables.')
  }

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    process.env.VAPID_PUBLIC_KEY || '',
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