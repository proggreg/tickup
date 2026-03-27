import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';
import { createList } from '../helpers/lists';

test.describe('Todos', () => {
    test('should create a todo without a list', async ({ request }) => {
        const testId = uuidv4();

        const todoName = `Todo in a list ${testId}`;
        const todo = await createTodo(request, {
            name: todoName,
        });

        expect(todo).toBeTruthy();
        expect(todo.id).toBeTruthy();
    });

    test('should create a todo within a list', async ({ request }) => {
        const testId = uuidv4();

        const list = await createList(request, {
            name: `Test List ${testId}`,
        });

        const todoName = `Todo in a list ${testId}`;
        const todo = await createTodo(request, {
            name: todoName,
            listId: list.id,
        });

        expect(todo).toBeTruthy();
        expect(todo.id).toBeTruthy();
    });
});
