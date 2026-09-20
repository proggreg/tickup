import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';
import { createList } from '../helpers/lists';

test.describe('Homepage - update todo from Recent section', () => {
    test('marking a recent todo done does not 500', async ({ request }) => {
        const testId = uuidv4();

        const list = await createList(request, {
            name: `Test List ${testId}`,
        });

        const todoName = `Recent Todo ${testId}`;
        await createTodo(request, {
            name: todoName,
            dueDate: new Date(),
            listId: list.id,
        });

        // GET /api/todos?recent=true joins Lists and attaches a `list` object
        // to each todo (server/api/todos.ts) for display purposes.
        const recentResponse = await request.get('/api/todos?recent=true');
        const recentTodos = await recentResponse.json();
        const todo = recentTodos.find((t) => t.name === todoName);
        expect(todo).toBeTruthy();
        expect(todo.list).toBeTruthy();
        // Raw Supabase relation key from `.select('*, Lists(id, name)')` must not
        // leak - objectToSnake would turn it into `lists`, an unknown Todos column.
        expect(todo.Lists).toBeUndefined();

        // Mimic the mobile homepage "Recent" checkbox flow: the full todo
        // object (including the joined `list` field, which is not a real
        // Todos column) is PUT back when the todo is marked done.
        const updateResponse = await request.put(`/api/todo/${todo.id}`, {
            data: { ...todo, status: 'Closed' },
        });

        expect(updateResponse.status()).toBe(200);
        const updated = await updateResponse.json();
        expect(updated.status).toBe('Closed');
    });
});
