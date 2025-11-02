import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody<Todo>(event)
  const supabase = await serverSupabaseClient(event)

  try {
    // Transform camelCase fields to snake_case for database
    const todoData: any = {
      name: body.name,
      desc: body.desc,
      status: body.status || 'To Do',
      attachments: body.attachments || []
    }
    
    // Only include defined fields
    if (body.priority !== undefined) todoData.priority = body.priority
    if (body.type !== undefined) todoData.type = body.type
    if (body.dueDate !== undefined) todoData.due_date = body.dueDate
    if (body.completedDate !== undefined) todoData.completed_date = body.completedDate
    if (body.order !== undefined) todoData.order = body.order
    if (body.userId !== undefined) todoData.user_id = body.userId
    if (body.listId !== undefined) todoData.list_id = body.listId
    if (body.githubBranchName !== undefined) todoData.github_branch_name = body.githubBranchName
    if (body.notificationDateTime !== undefined) todoData.notification_date_time = body.notificationDateTime
    if (body.notificationSent !== undefined) todoData.notification_sent = body.notificationSent

    const { data, error } = await supabase.from('Todos').insert([todoData]).select()

    if (error) {
      console.error('Supabase error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    // Transform snake_case fields back to camelCase for API response
    const result = data[0]
    if (result) {
      return {
        ...result,
        dueDate: result.due_date,
        completedDate: result.completed_date,
        userId: result.user_id,
        listId: result.list_id,
        githubBranchName: result.github_branch_name,
        notificationDateTime: result.notification_date_time,
        notificationSent: result.notification_sent,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
    }

    return result
  }
  catch (e) {
    console.error('error', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create todo'
    })
  }
})
