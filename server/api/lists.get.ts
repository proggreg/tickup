import { serverSupabaseClient } from '#supabase/server'
export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event);
    return (await client.from('Lists').select('*')).data
  }
  catch (error) {
    return error
  }
})
