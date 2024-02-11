import { getToken } from '#auth'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    const token = await getToken({ event })

    if (!body.userId && token) {
      body.userId = token.sub
    }
    return await new ListSchema(body).save()
  } catch (error) {
    return error
  }
})