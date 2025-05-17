// import { getToken } from '#auth' // removed, sidebase/nuxt-auth

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    // TODO: Replace auth logic as needed

    if (body.userId) {
      console.log('userid being sent from frontend please stop', body.userId)
    }

    if (!body.userId) {
      // TODO: Replace auth logic as needed
    }
    return await new ListSchema(body).save()
  }
  catch (error) {
    return error
  }
})
