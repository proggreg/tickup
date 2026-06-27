import { describe, expect } from 'vitest';
import { apiTest } from '../fixtures/api';

describe('Todo API endpoints', () => {
    apiTest('should create a todo via API', async ({ createTodo }) => {
        const todo = await createTodo({
            name: 'Test Todo',
            desc: 'Test Description',
        });

        expect(todo).toBeDefined();
        expect(todo.id).toBeDefined();
        expect(todo.name).toBe('Test Todo');
        expect(todo.desc).toBe('Test Description');
    });

    apiTest('should get a todo via API', async ({ createTodo, getTodo }) => {
        const created = await createTodo({
            name: 'Get Test Todo',
        });

        const fetched = await getTodo(created.id as string | number);

        expect(fetched.id).toBe(created.id);
        expect(fetched.name).toBe('Get Test Todo');
    });

    apiTest('should update a todo via API', async ({ createTodo, updateTodo, getTodo }) => {
        const created = await createTodo({
            name: 'Original Name',
        });

        const updated = await updateTodo(created.id as string | number, {
            name: 'Updated Name',
        });

        expect(updated.name).toBe('Updated Name');

        const fetched = await getTodo(created.id as string | number);
        expect(fetched.name).toBe('Updated Name');
    });

    apiTest('should delete a todo via API', async ({ createTodo, deleteTodo, getTodo }) => {
        const created = await createTodo({
            name: 'Delete Test Todo',
        });

        await deleteTodo(created.id as string | number);

        // Verify it's deleted by trying to fetch it
        try {
            await getTodo(created.id as string | number);
            expect.fail('Should have thrown error for deleted todo');
        } catch (err) {
            // Expected - todo not found
        }
    });

    apiTest(
        'should update todo with parent_id via API',
        async ({ createTodo, updateTodo, getTodo }) => {
            const parent = await createTodo({
                name: 'Parent Todo',
            });

            const child = await createTodo({
                name: 'Child Todo',
            });

            const updated = await updateTodo(child.id as string | number, {
                parentId: parent.id,
            });

            expect(updated.parentId).toBe(parent.id);

            const fetched = await getTodo(child.id as string | number);
            expect(fetched.parentId).toBe(parent.id);
        },
    );
});
