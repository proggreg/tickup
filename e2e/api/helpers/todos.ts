import { createNewTodoState } from '../../../app/stores/helpers';
import type { Todo } from '../../../index';
import { APIRequestContext } from '@playwright/test';

export async function createTodo(
    request: APIRequestContext,
    todo: {
        name: string;
        dueDate: Date;
        listId?: string;
        parentId?: string;
    },
) {
    const payload: Todo = { ...createNewTodoState(), ...todo };

    const response = await request.post('/api/todo', {
        data: payload,
    });

    return await response.json();
}
