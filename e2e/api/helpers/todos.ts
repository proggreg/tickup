import { createNewTodoState } from '../../../app/stores/helpers';
import type { Todo } from '../../../index';

export async function createTodo(request, todo: {
    name: string;
    dueDate?: Date;
    listId?: string;
    parentId?: string;
}): Promise<Todo> {
    const payload: Todo = { ...createNewTodoState(), ...todo };

    const response = await request.post('/api/todo', {
        data: payload,
    });

    return await response.json();
}
