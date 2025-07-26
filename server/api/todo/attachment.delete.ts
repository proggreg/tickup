import { TodoSchema } from '~/server/models/todo.schema'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Find todo and attachment
    const todo = await TodoSchema.findById(todoId)
    if (!todo) {
      throw createError({
        statusCode: 404,
        message: 'Todo not found',
      })
    }

    const attachment = todo.attachments?.find(a => a._id === attachmentId)
    if (!attachment) {
      throw createError({
        statusCode: 404,
        message: 'Attachment not found',
      })
    }

    // Delete file from filesystem
    const filepath = join(process.cwd(), 'public', attachment.filename)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    // Remove attachment from todo
    todo.attachments = todo.attachments.filter(a => a._id !== attachmentId)
    await todo.save()

    return {
      success: true,
      message: 'Attachment deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting attachment:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete attachment',
    })
  }
}) 