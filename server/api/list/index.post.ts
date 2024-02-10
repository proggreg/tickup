import { getToken, getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    console.log('create list', body)
    const token = await getToken({ event })
    console.log('token.sub', token.sub)

    if (!body.userId) {
      body.userId = token.sub
    }
    return await new ListSchema(body).save()
  } catch (error) {
    return error
  }
})