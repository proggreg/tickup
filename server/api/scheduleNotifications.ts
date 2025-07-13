import webpush from 'web-push'

export default defineEventHandler(async (event) => {
  console.log('🔔 ScheduleNotifications endpoint called')
  
  // Security: require a secret token in the header
  const token = getHeader(event, 'x-cron-secret')
  console.log('token', token)

  console.log('process.env.SCHEDULER_SECRET', process.env.SCHEDULER_SECRET)
  if (token !== process.env.SCHEDULER_SECRET) {
    console.log('❌ Unauthorized access attempt - invalid token')
    return { error: 'Unauthorized' }
  }
  console.log('✅ Authorization successful here')

  const config = useRuntimeConfig()
  const VAPID_PUBLIC_KEY = config.public.VAPID_KEY
  const VAPID_PRIVATE_KEY = config.private.vapidPrivateKey

  console.log('🔑 VAPID keys configured:', {
    publicKey: VAPID_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
    privateKey: VAPID_PRIVATE_KEY ? '✅ Set' : '❌ Missing'
  })

  webpush.setVapidDetails(
    'mailto:greg.field1992@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )

  // Find todos with a notificationDateTime in the past and not yet notified
  const now = new Date()
  console.log('⏰ Current time:', now.toISOString())
  
  const todos = await TodoSchema.find({
    notificationDateTime: { $lte: now },
    notificationSent: { $ne: true }
  })
  
  console.log(`📋 Found ${todos.length} todos that need notifications`)
  
  if (todos.length > 0) {
    console.log('📝 Todos requiring notifications:', todos.map(t => ({
      id: t._id,
      name: t.name,
      userId: t.userId,
      notificationDateTime: t.notificationDateTime,
      notificationSent: t.notificationSent
    })))
  }

  let sent = 0
  const userSubscriptions = []
  for (const todo of todos) {
    console.log(`\n🔄 Processing todo: ${todo.name} (ID: ${todo._id})`)
    
    // Find the user
    const user = await UserSchema.findOne({ _id: todo.userId })
    console.log(`👤 User lookup for ${todo.userId}:`, user ? '✅ Found' : '❌ Not found')
    
    if (!user) {
      console.log(`❌ User not found for todo ${todo._id}`)
      continue
    }
    
    if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      console.log(`❌ No push subscriptions found for user ${user.username}`)
      continue
    }
    userSubscriptions.push(user)
    
    console.log(`📱 User ${user.username} has ${user.pushSubscriptions.length} push subscriptions`)

    // Send notification to all subscriptions
    for (let i = 0; i < user.pushSubscriptions.length; i++) {
      const sub = user.pushSubscriptions[i]
      console.log(`📤 Attempting to send notification ${i + 1}/${user.pushSubscriptions.length}`)
      
      try {
        const payload = JSON.stringify({
          title: 'Todo Reminder',
          message: `Reminder for todo: ${todo.name}`,
        })
        
        console.log('📦 Notification payload:', payload)
        console.log('🔗 Subscription endpoint:', sub.endpoint ? '✅ Present' : '❌ Missing')
        
        await webpush.sendNotification(sub, payload)
        console.log(`✅ Notification sent successfully to subscription ${i + 1}`)
        sent++
      } catch (e: any) {
        console.error(`❌ Failed to send notification to subscription ${i + 1}:`, e)
        console.error('🔍 Error details:', {
          message: e?.message || 'Unknown error',
          statusCode: e?.statusCode,
          headers: e?.headers,
          body: e?.body
        })
      }
    }
    
    // Mark todo as notified
    console.log(`💾 Marking todo ${todo._id} as notified`)
    todo.notificationSent = true
    await todo.save()
    console.log(`✅ Todo ${todo._id} marked as notified`)
  }
  console.log(`userSubscriptions ${userSubscriptions}`)
  console.log(`\n📊 Summary: ${sent} notifications sent out of ${todos.length} todos processed`)
  return { sent, checked: todos.length, todos }
}) 