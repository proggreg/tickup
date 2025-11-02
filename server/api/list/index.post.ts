import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody<List>(event)
  const supabase = await serverSupabaseClient(event)
  try {
    const { data, error} = await supabase.from('Lists').insert([{
      name: body.name
    }]).select()

    if (error) return error

    return data[0]
  }
  catch (error) {
    return error
  }
})
