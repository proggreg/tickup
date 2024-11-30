import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    // Handle webhook payload
    console.log('Received webhook:', body)
    const githubEvent = event.headers.get('X-GitHub-Event')

    if (githubEvent === 'delete') {
        // Handle delete event
        console.log('Received delete event:', body)
        const ref = body.ref
        return await TodoSchema.find({ name: ref }).updateOne({ status: 'deleted' })
      return {
        status: 'success',
        message: 'Webhook received'
      }
    }
    
    return {
      status: 'success',
      message: 'Webhook received'
    }
  } catch (error) {
    console.error('Webhook error:', error)
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})
