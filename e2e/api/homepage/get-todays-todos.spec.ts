import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { createTodo } from '../helpers/todos';
import { createList } from '../helpers/lists';

test.describe('Homepage - todos list', () => {
    test('should include todos created in a list', async ({ request }) => {
        const testId = uuidv4();

        const list = await createList(request, {
            name: `Test List ${testId}`,
        });

        const todoName = `Homepage List Todo ${testId}`;
        await createTodo(request, {
            name: todoName,
            dueDate: new Date(),
            listId: list.id,
        });

        const homepageTodosResponse = await request.get('/api/todos?today=true');
        const homepageTodos = await homepageTodosResponse.json();

        const listTodo = homepageTodos.find(todo => todo.name === todoName);
        expect(listTodo).toBeTruthy();
    });

    test('should include subtasks of a todo', async ({ request }) => {
        const testId = uuidv4();

        const list = await createList(request, {
            name: `Test List ${testId}`,
        });

        const todoName = `Homepage List Todo ${testId}`;

        const todo = await createTodo(request, { name: todoName, dueDate: new Date(), listId: list.id });

        console.log('Todo created in a list', todo);

        const subtaskName = `Homepage Subtask ${testId}`;

        const subTask = await createTodo(request, { name: subtaskName, dueDate: new Date(), parentId: todo.id });

        console.log('Subtask Created: ', subTask);

        const homepageTodosResponse = await request.get('/api/todos?today=true');
        const homepageTodos = await homepageTodosResponse.json();

        const listTodo = homepageTodos.find(todo => todo.name === subtaskName);

        expect(listTodo).toBeTruthy();
    });
});
