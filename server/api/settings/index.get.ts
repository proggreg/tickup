export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const settings = await SettingsSchema.findOne({ userId: query.userId })
    if (!settings) {
      return {
        userId: query.userId,
        statuses: [],
        browserNotifications: false,
      }
    }
    return settings
  }
  catch (error) {
    return error
  }
})
