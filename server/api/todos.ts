import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const supabase = await serverSupabaseClient(event)
    
    if (query.today) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      
      const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .eq('user_id', query.id)
        .gte('due_date', start.toISOString())
        .lt('due_date', end.toISOString())

      if (error) {
        console.error('Supabase error:', error)
        return []
      }
      
      // Transform snake_case fields to camelCase
      return (data || []).map(todo => ({
        ...todo,
        dueDate: todo.due_date,
        completedDate: todo.completed_date,
        userId: todo.user_id,
        listId: todo.list_id,
        githubBranchName: todo.github_branch_name,
        notificationDateTime: todo.notification_date_time,
        notificationSent: todo.notification_sent,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at
      }))
    }

    if (query.overdue) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      
      const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .lt('due_date', start.toISOString())
        .order('due_date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return []
      }
      
      // Transform snake_case fields to camelCase
      return (data || []).map(todo => ({
        ...todo,
        dueDate: todo.due_date,
        completedDate: todo.completed_date,
        userId: todo.user_id,
        listId: todo.list_id,
        githubBranchName: todo.github_branch_name,
        notificationDateTime: todo.notification_date_time,
        notificationSent: todo.notification_sent,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at
      }))
    }

    const { data, error } = await supabase
      .from('Todos')
      .select('*')
      .eq('user_id', query.id)

    if (error) {
      console.error('Supabase error:', error)
      return []
    }
    
    // Transform snake_case fields to camelCase
    return (data || []).map(todo => ({
      ...todo,
      dueDate: todo.due_date,
      completedDate: todo.completed_date,
      userId: todo.user_id,
      listId: todo.list_id,
      githubBranchName: todo.github_branch_name,
      notificationDateTime: todo.notification_date_time,
      notificationSent: todo.notification_sent,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at
    }))
  }
  catch (error) {
    console.error('Error fetching todos:', error)
    return []
  }
})
