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
      console.log('payload:', body.payload)

      try {
        console.log('payload: ref', typeof body.payload.ref)
        console.log('payload: ref', body.ref)
        const payload = JSON.parse(body.payload)

        console.log('payload: ref', payload.ref)
        
        const response = await TodoSchema.findOneAndUpdate({
        githubBranchName: payload.ref
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
        console.log('Received delete event:', typeof body, body)

        if (typeof body === 'string') {
          const b = JSON.parse(body)
          console.log(Object.keys(b))
          return {
            status: 'error',
            message: 'Invalid request'
          }
        }
        console.log('body.ref:', body.ref)

        try {
            // const payload = JSON.parse(body.payload)

            console.log('payload: ref', body.ref)
            
            const response = await TodoSchema.findOneAndUpdate({
            githubBranchName: body.ref
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
