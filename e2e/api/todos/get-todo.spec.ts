import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';

test.describe('Get a todo', () => {
    test('should return a todo by id', async ({ request }) => {
        const testId = uuidv4();
        const created = await createTodo(request, {
            name: `Get Todo ${testId}`,
            dueDate: new Date(),
        });

        expect(created.id).toBeTruthy();

        const response = await request.get(`/api/todo/${created.id}`);
        expect(response.status()).toEqual(200);

        const todo = await response.json();
        expect(todo.id).toEqual(created.id);
        expect(todo.name).toEqual(`Get Todo ${testId}`);
        expect(todo.status).toBeTruthy();
    });

    test('should return 404 for a todo that does not exist', async ({
        request,
    }) => {
        const nonExistentId = uuidv4();
        const response = await request.get(`/api/todo/${nonExistentId}`);
        expect(response.status()).toEqual(404);
    });

    test('should return all key fields for a retrieved todo', async ({
        request,
    }) => {
        const testId = uuidv4();
        const created = await createTodo(request, {
            name: `Full Fields Todo ${testId}`,
            dueDate: new Date(),
        });

        const response = await request.get(`/api/todo/${created.id}`);
        expect(response.status()).toEqual(200);

        const todo = await response.json();
        expect(todo.id).toEqual(created.id);
        expect(todo.name).toEqual(`Full Fields Todo ${testId}`);
        expect(todo.status).toBeTruthy();
        expect(todo.color).toBeTruthy();
        expect(todo.priorityLev).toBeDefined();
    });
});
