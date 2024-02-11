import { getToken } from '#auth'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    const { sub } = await getToken({ event })

    if (!body.userId) {
      body.userId = sub
    }
    return await new ListSchema(body).save()
  } catch (error) {
    return error
  }
})