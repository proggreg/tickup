export default defineEventHandler(async (event) => {
  try {
    return await ListSchema.findById({ _id: event.context.params?._id })
  }
  catch (error) {
    return error
  }
})
