import { serverSupabaseClient } from '#supabase/server'
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<List>(event)
    const client = await serverSupabaseClient(event);
    return await client.from('Lists').update({
      name: body.name
    }).eq('id', body.id);
  }
  catch (error) {
    return error
  }
})
