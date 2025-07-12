import webpush from 'web-push'

export default defineEventHandler(async (event) => {
  // Security: require a secret token in the header
  const token = getHeader(event, 'x-cron-secret')
  if (token !== process.env.SCHEDULER_SECRET) {
    return { error: 'Unauthorized' }
  }

  const config = useRuntimeConfig()
  const VAPID_PUBLIC_KEY = config.public.VAPID_KEY
  const VAPID_PRIVATE_KEY = config.private.vapidPrivateKey

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )

  // Find todos with a notificationDateTime in the past and not yet notified
  const now = new Date()
  const todos = await TodoSchema.find({
    notificationDateTime: { $lte: now },
    notificationSent: { $ne: true }
  })

  let sent = 0
  for (const todo of todos) {
    // Find the user
    const user = await UserSchema.findOne({ _id: todo.userId })
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

  return { sent, checked: todos.length }
}) 