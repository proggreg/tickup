import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  if (!event.context.params || !event.context.params._id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Todo ID is required'
    })
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase
    .from('Todos')
    .select('*')
    .eq('id', event.context.params._id)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Todo not found'
    })
  }

  // Transform snake_case fields back to camelCase for API response
  if (data) {
    return {
      ...data,
      dueDate: data.due_date,
      completedDate: data.completed_date,
      userId: data.user_id,
      listId: data.list_id,
      githubBranchName: data.github_branch_name,
      notificationDateTime: data.notification_date_time,
      notificationSent: data.notification_sent,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  return data
})
