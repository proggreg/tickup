import { describe, expect, it, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useListsStore } from '../../app/stores/lists';

describe('lists store - setTodoDetails', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('defaults a missing due date on the todo being submitted, not on newTodo', () => {
        const store = useListsStore();
        const todo = { name: 'Test todo' } as Task;

        store.setTodoDetails(todo);

        expect(todo.dueDate).toBeInstanceOf(Date);
        // Regression guard: the bug set `this.newTodo.dueDate` instead of
        // `todo.dueDate`, which left the todo actually sent to /api/todo
        // without a due date whenever it wasn't the same object as newTodo
        // (e.g. the global TodoDialog). A todo with no due_date never matches
        // the homepage's Today/Overdue queries and silently vanished on the
        // next refetch.
        expect(store.newTodo.dueDate).toBeUndefined();
    });

    it('preserves an already chosen due date', () => {
        const store = useListsStore();
        const chosen = new Date('2030-01-01T00:00:00Z');
        const todo = { name: 'Test todo', dueDate: chosen } as Task;

        store.setTodoDetails(todo);

        expect(todo.dueDate).toBe(chosen);
    });
});
