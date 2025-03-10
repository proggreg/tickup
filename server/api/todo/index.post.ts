export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    return await new TodoSchema(body).save()
  }
  catch (e) {
    console.error('error', e)
    return e
  }
})
