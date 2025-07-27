import { AttachmentSchema } from '~/server/models/attachment.schema'

export default defineEventHandler(async (event) => {
  try {
    const attachmentId = getRouterParam(event, 'id')
    
    if (!attachmentId) {
      throw createError({
        statusCode: 400,
        message: 'Attachment ID is required',
      })
    }

    const attachment = await AttachmentSchema.findById(attachmentId)
    if (!attachment) {
      throw createError({
        statusCode: 404,
        message: 'Attachment not found',
      })
    }

    // Set appropriate headers
    setHeader(event, 'Content-Type', attachment.mimeType)
    setHeader(event, 'Content-Disposition', `inline; filename="${attachment.originalName}"`)
    setHeader(event, 'Content-Length', attachment.size.toString())

    // Return the file data
    return attachment.data
  } catch (error) {
    console.error('Error serving attachment:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to serve attachment',
    })
  }
}) 