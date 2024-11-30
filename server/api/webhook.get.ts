import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('event', event)

  const body = await readBody(event)
  
  try {
    
    const githubEvent = event.headers.get('X-GitHub-Event')

    if (githubEvent === 'delete') {
        // Handle delete event
        console.log('Received delete event:', body)
        const ref = body.ref
        console.log('Deleted todo:', ref)
        const response = await TodoSchema.findOneAndUpdate({
          githubBranchName: ref
        }, {status: 'Closed'}, { new: true })
        console.log('Updated todo:', response)
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
