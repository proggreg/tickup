export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params || !event.context.params._id) {
      throw new Error('no id')
    }
    const todo = await TodoSchema.findById(event.context.params._id)
    console.log('got todo', todo)
    return todo
  } catch (e) {
    return e
  }
})