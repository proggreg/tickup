export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    console.log('update settings', body)
    // console.log('update settings', body)
    // return body
    const options = { upsert: true }
    return await SettingsSchema.updateOne(
      { userId: body.userId },
      {
        statuses: body.statuses,
        pusherAppId: body.pusherAppId,
        pusherKey: body.pusherKey,
        pusherSecret: body.pusherSecret,
        pusherCluster: body.pusherCluster,
      },
      options,
    )
  }
  catch (error) {
    return error
  }
})
