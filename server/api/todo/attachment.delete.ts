// import { TodoSchema } from '~/server/models/todo.schema'
// import { AttachmentSchema } from '~/server/models/attachment.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { todoId, attachmentId } = body

    if (!todoId || !attachmentId) {
      throw createError({
        statusCode: 400,
        message: 'Todo ID and attachment ID are required',
      })
    }

    // Find todo and attachment reference
    // const todo = await TodoSchema.findById(todoId)
    // if (!todo) {
    //   throw createError({
    //     statusCode: 404,
    //     message: 'Todo not found',
    //   })
    // }

    // const attachmentRef = todo.attachments?.find(a => a.attachmentId === attachmentId)
    // if (!attachmentRef) {
    //   throw createError({
    //     statusCode: 404,
    //     message: 'Attachment not found',
    //   })
    // }

    // Delete attachment from MongoDB
    // await AttachmentSchema.findByIdAndDelete(attachmentId)

    // // Remove attachment reference from todo
    // todo.attachments = todo.attachments.filter(a => a.attachmentId !== attachmentId)
    // await todo.save()

    return {
      success: true,
      message: 'Attachment deleted successfully',
    }
  }
 catch (error) {
    console.error('Error deleting attachment:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete attachment',
    })
  }
})
