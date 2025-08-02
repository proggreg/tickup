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
    if (!notificationDateTime) {
      let testTitle = 'Tickup Push Test';
      let testMessage = 'Push notifications are working! You will get reminders for your todos.';
      if (todoId) {
        const todo = await TodoSchema.findById(todoId);
        if (todo && todo.name) {
          testTitle = todo.name;
          let desc = todo.desc ? `\nDescription: ${todo.desc}` : '';
          let due = todo.dueDate ? `\nDue: ${new Date(todo.dueDate).toLocaleString()}` : '';
          testMessage = `Test notification for: ${todo.name}${desc}${due}`;
        }
      }
      await webpush.sendNotification(subscription, JSON.stringify({
        title: testTitle,
        body: testMessage,
      }))
      
      return { success: true }
    }
    // If scheduling, just update the todo and return
    return { scheduled: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    throw error
  }
})
