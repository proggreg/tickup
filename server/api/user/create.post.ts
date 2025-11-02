import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  try {
    // Get the authenticated user from Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      })
    }

    // Check if user already exists in our Users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (existingUser) {
      // User already exists, return them
      return { id: existingUser.id, message: 'User already exists' }
    }

    // Create new user in our Users table
    const userData = {
      id: authUser.id,
      username: body.username || authUser.email?.split('@')[0] || 'user',
      email: authUser.email,
      push_subscriptions: []
    }

    const { data: newUser, error: createError } = await supabase
      .from('Users')
      .insert([userData])
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError({
        statusCode: 500,
        statusMessage: createError.message
      })
    }

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      message: 'User created successfully'
    }
  }
  catch (e) {
    console.error('Error in user creation:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user'
    })
  }
})