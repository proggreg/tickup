import { defineEventHandler, getHeader } from 'h3'
import mongoose from 'mongoose'
import webpush from 'web-push'

export default defineEventHandler(async (event) => {
  // Security: require a secret token in the header
  const token = getHeader(event, 'x-cron-secret')
  if (token !== process.env.SCHEDULER_SECRET) {
    return { error: 'Unauthorized' }
  }

  const config = useRuntimeConfig()
  const MONGODB_URI = config.mongoose.uri
  const VAPID_PUBLIC_KEY = config.public.VAPID_KEY
  const VAPID_PRIVATE_KEY = config.private.vapidPrivateKey

  // Define User and Todo schemas for direct use
  const userSchema = new mongoose.Schema({
    username: String,
    pushSubscriptions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  })
  const todoSchema = new mongoose.Schema({
    userId: String,
    name: String,
    notificationDateTime: Date,
    notificationSent: Boolean,
  })
  const User = mongoose.models.User || mongoose.model('User', userSchema)
  const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema)

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )

  await mongoose.connect(MONGODB_URI)

  // Find todos with a notificationDateTime in the past and not yet notified
  const now = new Date()
  const todos = await Todo.find({
    notificationDateTime: { $lte: now },
    notificationSent: { $ne: true }
  })

  let sent = 0
  for (const todo of todos) {
    // Find the user
    const user = await User.findOne({ _id: todo.userId })
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) continue

    // Send notification to all subscriptions
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: 'Todo Reminder',
          message: `Reminder for todo: ${todo.name}`,
        }))
        sent++
      } catch (e) {
        // Ignore errors for now
      }
    }
    // Mark todo as notified
    todo.notificationSent = true
    await todo.save()
  }

  await mongoose.disconnect()
  return { sent, checked: todos.length }
}) 