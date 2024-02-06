export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('create todo', body)

  try {
    return await new TodoSchema(body).save()
  } catch (e) {
    console.log('error', e)
    return e
  }
})
