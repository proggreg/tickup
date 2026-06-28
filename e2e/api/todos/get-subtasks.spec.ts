import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';

test.describe('Get subtasks of a todo', () => {
    test('should return subtasks for a parent todo', async ({ request }) => {
        const testId = uuidv4();
        const parent = await createTodo(request, {
            name: `Parent ${testId}`,
            dueDate: new Date(),
        });

        const child = await createTodo(request, {
            name: `Child ${testId}`,
            dueDate: new Date(),
            parentId: parent.id,
        });

        const response = await request.get(`/api/todo/${parent.id}/subtasks`);
        expect(response.status()).toEqual(200);

        const subtasks = await response.json();
        expect(subtasks).toHaveLength(1);
        expect(subtasks[0].id).toEqual(child.id);
        expect(subtasks[0].name).toEqual(`Child ${testId}`);
        expect(subtasks[0].parentId).toEqual(parent.id);
    });

    test('should return empty array when todo has no subtasks', async ({
        request,
    }) => {
        const testId = uuidv4();
        const parent = await createTodo(request, {
            name: `No Children ${testId}`,
            dueDate: new Date(),
        });

        const response = await request.get(`/api/todo/${parent.id}/subtasks`);
        expect(response.status()).toEqual(200);

        const subtasks = await response.json();
        expect(subtasks).toEqual([]);
    });

    test('should return all subtasks when a parent has multiple children', async ({
        request,
    }) => {
        const testId = uuidv4();
        const parent = await createTodo(request, {
            name: `Multi-Child Parent ${testId}`,
            dueDate: new Date(),
        });

        const child1 = await createTodo(request, {
            name: `Child One ${testId}`,
            dueDate: new Date(),
            parentId: parent.id,
        });

        const child2 = await createTodo(request, {
            name: `Child Two ${testId}`,
            dueDate: new Date(),
            parentId: parent.id,
        });

        const child3 = await createTodo(request, {
            name: `Child Three ${testId}`,
            dueDate: new Date(),
            parentId: parent.id,
        });

        const response = await request.get(`/api/todo/${parent.id}/subtasks`);
        expect(response.status()).toEqual(200);

        const subtasks = await response.json();
        expect(subtasks).toHaveLength(3);

        const ids = subtasks.map((s: { id: string }) => s.id);
        expect(ids).toContain(child1.id);
        expect(ids).toContain(child2.id);
        expect(ids).toContain(child3.id);

        subtasks.forEach((s: { parentId: string }) => {
            expect(s.parentId).toEqual(parent.id);
        });
    });

    test('should not return subtasks belonging to a different parent', async ({
        request,
    }) => {
        const testId = uuidv4();

        const parentA = await createTodo(request, {
            name: `Parent A ${testId}`,
            dueDate: new Date(),
        });

        const parentB = await createTodo(request, {
            name: `Parent B ${testId}`,
            dueDate: new Date(),
        });

        await createTodo(request, {
            name: `Child of B ${testId}`,
            dueDate: new Date(),
            parentId: parentB.id,
        });

        const response = await request.get(`/api/todo/${parentA.id}/subtasks`);
        expect(response.status()).toEqual(200);

        const subtasks = await response.json();
        expect(subtasks).toEqual([]);
    });

    test('should return empty array for a non-existent todo id', async ({
        request,
    }) => {
    // Use 0 — a valid integer that will never match a real todo id
        const response = await request.get(`/api/todo/0/subtasks`);
        expect(response.status()).toEqual(200);

        const subtasks = await response.json();
        expect(subtasks).toEqual([]);
    });

    test('should return 500 when id is not a valid integer', async ({
        request,
    }) => {
    // The DB column is an integer; passing a UUID causes a type error -> 500
        const nonExistentId = uuidv4();
        const response = await request.get(`/api/todo/${nonExistentId}/subtasks`);
        expect(response.status()).toEqual(500);
    });
});
