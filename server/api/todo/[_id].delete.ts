export default defineEventHandler(async (event) => {
  try {
    return await TodoSchema.findOneAndDelete({ _id: event.context.params?._id })
  } catch (e) {
    return e
  }
})
