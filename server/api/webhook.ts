import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('event', event)

  if (event.method === 'GET') {
    const query = getQuery(event)
    const ref = query.ref
    const response = await TodoSchema.findOneAndUpdate({
        githubBranchName: ref
      }, {status: 'Closed'}, { new: true })
      console.log('Updated todo: ' + ref, response)
    return {
      status: 'error',
      message: 'Invalid method'
    }
  }

  const body = await readBody(event)
  
  try {
    
    const githubEvent = event.headers.get('X-GitHub-Event')

    if (githubEvent === 'delete') {
        // Handle delete event
        console.log('Received delete event:', body)
        console.log('payload:', body.payload)
        try {
            const data = JSON.parse(body)
            console.log('data parsed:', data.payload.ref)
        } catch (error) {
            console.error('Invalid JSON:', error)
        }
        const ref = body.payload.ref
        console.log('Deleted branch:', ref)
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
