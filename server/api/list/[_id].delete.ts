export default defineEventHandler(async (event) => {
  try {
    await TodoSchema.deleteMany({ list_id: event.context.params?._id })
    return await ListSchema.findOneAndDelete({ _id: event.context.params?._id })
  } catch (e) {
    return e
  }
})
