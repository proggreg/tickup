import { describe, it, expect } from 'vitest';
import { createNewListState, createNewTodoState } from '../../../app/stores/helpers';

describe('createNewListState', () => {
    it('returns correct default shape', () => {
        const list = createNewListState();
        expect(list.name).toBe('');
        expect(list.todos).toEqual([]);
        expect(list.icon).toBe('mdi-format-list-bulleted');
        expect(list.listType).toBe('simple');
    });

    it('returns independent objects on each call', () => {
        const a = createNewListState();
        const b = createNewListState();
        a.todos.push({ name: 'x' } as never);
        expect(b.todos).toHaveLength(0);
    });
});

describe('createNewTodoState', () => {
    it('returns correct default shape', () => {
        const todo = createNewTodoState();
        expect(todo.name).toBe('');
        expect(todo.status).toBe('Open');
        expect(todo.desc).toBe('');
        expect(todo.edit).toBe(false);
        expect(todo.color).toBe('#87909e');
        expect(todo.links).toEqual([]);
        expect(todo.attachments).toEqual([]);
        expect(todo.priorityLev).toBe('');
    });

    it('returns independent objects on each call', () => {
        const a = createNewTodoState();
        const b = createNewTodoState();
        a.links.push('http://example.com');
        expect(b.links).toHaveLength(0);
    });
});
