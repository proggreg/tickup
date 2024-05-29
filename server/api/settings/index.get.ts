export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    console.log('get settings here', query)

    return await SettingsSchema.find({ userId: query.userId })
  } catch (error) {
    return error
  }
})