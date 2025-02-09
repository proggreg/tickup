import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const query = getQuery(event)
    const ref = query.ref
    const response = await TodoSchema.findOneAndUpdate({
      githubBranchName: ref,
    }, { status: 'Closed' }, { new: true })
    console.log('Updated todo: ' + ref, response)
    return response
  }

  const body = await readBody(event)

  try {
    const githubEvent = event.headers.get('X-GitHub-Event')

    if (githubEvent === 'push') {
      try {
        const ref = body.ref.split('/').pop()
        console.log('Received push event:', ref)
        const response = await TodoSchema.findOneAndUpdate({
          githubBranchName: ref,
        }, { status: 'In Progress' }, { new: true })
        if (!response) {
          useBugsnag().notify(`Todo not found ref: ${ref}`)
          throw Error(`Todo not found ref: ${ref}`)
        }
        console.log('Updated todo:', response)
      }
      catch (error) {
        console.error('Error:', error)
      }

      return {
        status: 'success',
        message: 'Webhook received',
      }
    }
    else if (githubEvent === 'delete') {
      const ref = body.ref.split('/').pop()
      console.log('Received delete event:', ref)
      try {
        const response = await TodoSchema.findOneAndUpdate({
          githubBranchName: ref,
        }, { status: 'Closed' }, { new: true })
        console.log('Set todo to closed:', response)
      }
      catch (error) {
        console.error('Error:', error)
      }

      return {
        status: 'success',
        message: 'Webhook received',
      }
    }

    return {
      status: 'success',
      message: 'Webhook received',
    }
  }
  catch (error) {
    console.error('Webhook error:', error)

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
