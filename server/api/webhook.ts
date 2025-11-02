import { defineEventHandler } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  if (event.method === 'GET') {
    const query = getQuery(event)
    const ref = query.ref
    
    const { data, error } = await supabase
      .from('Todos')
      .update({ status: 'Closed' })
      .eq('github_branch_name', ref)
      .select()
      .single()

    if (error) {
      console.error('Error updating todo:', error)
      return null
    }

    return data
  }

  const body = await readBody(event)

  try {
    const githubEvent = event.headers.get('X-GitHub-Event')

    if (githubEvent === 'push') {
      try {
        const ref = body.ref.split('/').pop()
        const { data, error } = await supabase
          .from('Todos')
          .update({ status: 'In Progress' })
          .eq('github_branch_name', ref)
          .select()
          .single()
          
        if (error || !data) {
          throw Error(`Todo not found ref: ${ref}`)
        }
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

      try {
        const { error } = await supabase
          .from('Todos')
          .update({ status: 'Closed' })
          .eq('github_branch_name', ref)
          
        if (error) {
          console.error('Error updating todo:', error)
        }
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
