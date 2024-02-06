export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    if (!event.context.params || !event.context.params._id) {
      throw new Error('no id')
    }
    return await TodoSchema.findOneAndUpdate({
      _id: event.context.params._id
    }, body, { new: true })
  } catch (e) {
    return e
  }
})
