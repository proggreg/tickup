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

    if (githubEvent === 'push') {
      // Handle push event
      console.log('Received push event:', body)

      try {
        const ref = body.ref.split('/').pop()
        console.log('payload: ref', body.ref)
        console.log('ref', ref)
        const response = await TodoSchema.findOneAndUpdate({
        githubBranchName: ref
      }, {status: 'In Progress'}, { new: true })
      console.log('Updated todo:', response)
      } catch (error) {
        console.error('Error:', error)
      }

      return {
        status: 'success',
        message: 'Webhook received'
      }
    } else if (githubEvent === 'delete') {
        // Handle delete event
        console.log('Received delete event:', body)
        const ref = body.ref.split('/').pop()
        console.log('payload: ref', body.ref)
        console.log('ref', ref)
        try {
            const response = await TodoSchema.findOneAndUpdate({
            githubBranchName: ref
          }, {status: 'Closed'}, { new: true })
          console.log('Updated todo:', response)
        } catch (error) {
          console.error('Error:', error)
        }

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
