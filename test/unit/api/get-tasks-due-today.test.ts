import { describe, expect } from 'vitest';
import { apiTest } from '../fixtures/api';

function getTodayBoundaries() {
    const now = new Date();
    const startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const endOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
    );
    return { startOfDay, endOfDay };
}

describe('GET /api/tasks/today', () => {
    const { startOfDay, endOfDay } = getTodayBoundaries();
    const dates = [
        { name: 'start of the day', date: startOfDay },
        { name: 'end of the day', date: endOfDay },
    ];

    for (const { name, date } of dates) {
        apiTest(
            `should include tasks due at ${name} in the response`,
            async ({ apiCall, createList, createTodo }) => {
                const testId = crypto.randomUUID();

                const list = await createList({
                    name: `Test List ${testId}`,
                });

                const taskName = `Homepage List Task ${testId}`;
                await createTodo({
                    name: taskName,
                    dueDate: date,
                    listId: list.id,
                });

                const response = await apiCall('/api/tasks/today');
                const todos = await response.json();

                const listTodo = todos.find((todo: { name: string }) => todo.name === taskName);
                expect(listTodo).toBeTruthy();
            },
        );
    }

    apiTest('should include subtasks of a todo', async ({ apiCall, createTodo }) => {
        const testId = crypto.randomUUID();

        const todoName = `Homepage List Todo ${testId}`;
        const todo = await createTodo({
            name: todoName,
            dueDate: new Date(),
        });

        const subtaskName = `Homepage Subtask ${testId}`;
        await createTodo({
            name: subtaskName,
            dueDate: new Date(),
            parentId: todo.id,
        });

        const response = await apiCall('/api/tasks/today');
        const todos = await response.json();

        const subtask = todos.find((todo: { name: string }) => todo.name === subtaskName);
        expect(subtask).toBeTruthy();
    });
});
