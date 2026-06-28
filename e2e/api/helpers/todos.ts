import { createNewTodoState } from '../../../app/stores/helpers';
import type { Todo } from '../../../index';
import type { APIRequestContext } from '@playwright/test';

export async function createTodo(request: APIRequestContext, todo: Todo) {
    const payload: Todo = { ...createNewTodoState(), ...todo };

    const response = await request.post('/api/todo', {
        data: payload,
    });

    return await response.json();
}
