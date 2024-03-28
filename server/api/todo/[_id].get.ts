export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params || !event.context.params._id) {
      throw new Error('no id')
    }
    return await TodoSchema.findById(event.context.params._id)
  } catch (e) {
    return e
  }
})