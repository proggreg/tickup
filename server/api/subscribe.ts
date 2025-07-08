import webpush from 'web-push'
import { readBody } from 'h3'
import { UserSchema } from '../models/users.schema'
import { TodoSchema } from '../models/todo.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const subscription = body.subscription
  const username = body.username
  const notificationDateTime = body.notificationDateTime
  const todoId = body.todoId

  console.log('subscription', subscription)
  console.log('NUXT_ENV_VAPID_PUBLIC_KEY', process.env.VAPID_PUBLIC_KEY)

  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (!vapidPrivateKey) {
    throw new Error('VAPID private key is not defined in environment variables.')
  }

  if (username && subscription) {
    await UserSchema.findOneAndUpdate(
      { username },
      { $addToSet: { pushSubscriptions: subscription } },
      { new: true, upsert: true }
    )
  }

  if (todoId && notificationDateTime) {
    await TodoSchema.findOneAndUpdate(
      { _id: todoId },
      { notificationDateTime: new Date(notificationDateTime), notificationSent: false },
      { new: true }
    )
  }

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    process.env.VAPID_PUBLIC_KEY || '',
    vapidPrivateKey
  )

  try {
    // Only send a test notification if not scheduling
    if (!notificationDateTime) {
      let testTitle = 'Tickup Push Test';
      let testMessage = 'Push notifications are working! You will get reminders for your todos.';
      if (todoId) {
        const todo = await TodoSchema.findById(todoId);
        if (todo && todo.name) {
          testTitle = todo.name;
          testMessage = `This is a test notification for your todo: ${todo.name}`;
        }
      }
      await webpush.sendNotification(subscription, JSON.stringify({
        title: testTitle,
        message: testMessage,
      }))
      console.log('Push notification sent successfully!')
      return { success: true }
    }
    // If scheduling, just update the todo and return
    return { scheduled: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    throw error
  }
})