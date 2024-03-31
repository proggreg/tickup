export default defineEventHandler(async (event) => {
  try {
    if (!event.context.params || !event.context.params._id) {
      throw new Error('no id')
    }

    const body = await readBody(event)
    body.updatedAt = new Date()
    
    return await ListSchema.findOneAndUpdate({ _id:  event.context.params._id }, body, { new: true })
  } catch (error) {
    return error
  }
})
