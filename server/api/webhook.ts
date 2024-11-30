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
            const payload = JSON.parse(body.payload)
            console.log('payload:', payload)
            console.log('payload: ref', payload.ref)
        } catch (error) {
          console.error('Error:', error)
        }
        console.log('payload:', body.payload["ref"])

        console.log('payload type', typeof body.payload)
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
