import { describe, expect, it, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useListsStore } from '../../app/stores/lists';

describe('lists store - sortByPriority', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('orders todos high, medium, low, none when ascending', () => {
        const store = useListsStore();
        store.currentList.todos = [
            { name: 'no priority', priorityLev: '' },
            { name: 'low', priorityLev: 'low' },
            { name: 'high', priorityLev: 'high' },
            { name: 'medium', priorityLev: 'medium' },
        ] as Task[];

        store.sortByPriority('ascending');

        expect(store.currentList.todos.map(t => t.name)).toEqual([
            'high',
            'medium',
            'low',
            'no priority',
        ]);
    });
});
