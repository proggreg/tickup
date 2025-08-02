import mongoose from 'mongoose'
import webpush from 'web-push'

const MONGODB_URI = process.env.MONGODB_URI || ''
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

// Define User and Todo schemas for direct use
const UserSchema = new mongoose.Schema({
  username: String,
  pushSubscriptions: { type: [mongoose.Schema.Types.Mixed], default: [] },
})
const TodoSchema = new mongoose.Schema({
  userId: String,
  name: String,
  notificationDateTime: Date,
  notificationSent: Boolean,
})
const User = mongoose.model('User', UserSchema)
const Todo = mongoose.model('Todo', TodoSchema)

webpush.setVapidDetails(
  'mailto:greg.field1992@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

async function main() {
  await mongoose.connect(MONGODB_URI)

  // Find todos with a notificationDateTime in the past and not yet notified
  const now = new Date()
  const todos = await Todo.find({
    notificationDateTime: { $lte: now },
    notificationSent: { $ne: true }
  })

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
      } catch (e) {
        console.error('Failed to send notification', e)
      }
    }
    // Mark todo as notified
    todo.notificationSent = true
    await todo.save()
  }

  await mongoose.disconnect()
}

await main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) }) 