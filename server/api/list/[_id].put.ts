export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    return await ListSchema.findOneAndUpdate({ _id: event.context.params?._id }, body, { new: true })
  }
  catch (error) {
    return error
  }
})
