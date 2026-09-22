import type { SupabaseClient } from '@supabase/supabase-js';

export function mapTodoToTask(todo: any) {
    return {
        ...todo,
        dueDate: todo.due_date,
        completedDate: todo.completed_date,
        userId: todo.user_id,
        listId: todo.list_id,
        parentId: todo.parent_id,
        githubBranchName: todo.github_branch_name,
        notificationDateTime: todo.notification_date_time,
        notificationSent: todo.notification_sent,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
    };
}

export class TaskService {
    private supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async create(task: Task) {
        return await this.supabase.from('Todos').insert([task]).select();
    }

    async update(id: string | number, updates: Partial<Task>) {
        const todoId = typeof id === 'string' ? parseInt(id, 10) : id;
        const { data, error } = await this.supabase
            .from('Todos')
            .update(updates)
            .eq('id', todoId)
            .select();

        if (error) {
            return { data: null, error };
        }

        return { data: data && data.length > 0 ? data[0] : null, error: null };
    }
}
