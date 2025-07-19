export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    console.log('update settings', body)
    // console.log('update settings', body)
    // return body
    const options = { upsert: true }
    const update: any = {}
    if (body.statuses) update.statuses = body.statuses
    if (typeof body.browserNotifications === 'boolean') update.browserNotifications = body.browserNotifications
    return await SettingsSchema.updateOne({ userId: body.userId }, update, options)
  }
  catch (error) {
    return error
  }
})
