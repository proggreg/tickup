import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get the id from the URL path
    // console.log(event)
    const id = event.context.params?._id
    
    console.log('Params:', event.context.params)
    console.log('ID:', id)
    console.log('URL:', event.node.req.url)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'List ID is required'
      })
    }
    
    const client = await serverSupabaseClient(event)
    
    return await client
      .from('Lists')
      .delete()
      .eq('id', id)
  }
  catch (error) {
    console.error('Delete error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})