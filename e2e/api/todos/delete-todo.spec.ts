import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';

test.describe('Delete a todo', () => {
    test('should delete a todo and return the deleted todo', async ({
        request,
    }) => {
        const testId = uuidv4();
        const todo = await createTodo(request, {
            name: `To delete ${testId}`,
            dueDate: new Date(),
        });

        expect(todo.id).toBeTruthy();

        const response = await request.delete(`/api/todo/${todo.id}`);
        expect(response.status()).toEqual(200);

        const deleted = await response.json();
        expect(deleted.id).toEqual(todo.id);
        expect(deleted.name).toEqual(`To delete ${testId}`);
    });

    test('should return 404 when getting a todo after deletion', async ({
        request,
    }) => {
        const testId = uuidv4();
        const todo = await createTodo(request, {
            name: `To delete then check ${testId}`,
            dueDate: new Date(),
        });

        expect(todo.id).toBeTruthy();

        // Delete the todo
        const deleteResponse = await request.delete(`/api/todo/${todo.id}`);
        expect(deleteResponse.status()).toEqual(200);

        // Now verify it no longer exists
        const getResponse = await request.get(`/api/todo/${todo.id}`);
        expect(getResponse.status()).toEqual(404);
    });

    test('should return an error when deleting a todo that does not exist', async ({
        request,
    }) => {
        const nonExistentId = uuidv4();
        const response = await request.delete(`/api/todo/${nonExistentId}`);
        expect([404, 500]).toContain(response.status());
    });
});
