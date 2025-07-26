import { TodoSchema } from '~/server/models/todo.schema'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const todoId = formData.get('todoId') as string
    const file = formData.get('file') as File

    if (!todoId || !file) {
      throw createError({
        statusCode: 400,
        message: 'Todo ID and file are required',
      })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw createError({
        statusCode: 400,
        message: 'File size must be less than 10MB',
      })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        message: 'File type not allowed',
      })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomId}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    // Create attachment object
    const attachment = {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/uploads/${filename}`,
      _id: crypto.randomUUID(),
      uploadedAt: new Date(),
    }

    // Update todo with new attachment
    const todo = await TodoSchema.findById(todoId)
    if (!todo) {
      throw createError({
        statusCode: 404,
        message: 'Todo not found',
      })
    }

    if (!todo.attachments) {
      todo.attachments = []
    }
    todo.attachments.push(attachment)
    await todo.save()

    return {
      success: true,
      attachment,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to upload file',
    })
  }
}) 