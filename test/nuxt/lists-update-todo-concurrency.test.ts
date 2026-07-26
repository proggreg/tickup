import { describe, expect, it, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useListsStore } from '../../app/stores/lists';

describe('lists store - updateTodo concurrency', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('serializes concurrent updateTodo calls instead of firing them as a burst', async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const callOrder: number[] = [];

        const fetchMock = vi.fn(async (url: string) => {
            const id = Number(url.split('/').pop());
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            callOrder.push(id);
            // Simulated latency so overlapping calls would actually overlap
            // in `inFlight`, the way real concurrent PUTs did in production.
            await new Promise(resolve => setTimeout(resolve, 20));
            inFlight--;
            return { id };
        });
        vi.stubGlobal('$fetch', fetchMock);

        const store = useListsStore();

        // Mirrors the Bugsnag breadcrumbs for error 6a5cbb44fdca5cb0d6f889aa:
        // several checkboxes tapped in quick succession on the mobile home
        // dashboard, each firing an unawaited updateTodo call for a different
        // todo, which produced a burst of concurrent PUT /api/todo/:id calls
        // that started failing with 500s under real load.
        const todos = [5013, 5014, 4405, 4404, 4401].map(
            id => ({ id, status: 'Closed' }) as Task,
        );
        await Promise.all(todos.map(todo => store.updateTodo(todo)));

        expect(fetchMock).toHaveBeenCalledTimes(5);
        // The regression this guards against: if updateTodo stops serializing
        // its requests, all 5 PUTs would be in flight at once (maxInFlight
        // === 5) — the exact burst shape that preceded the 500s.
        expect(maxInFlight).toBe(1);
        expect(callOrder).toEqual([5013, 5014, 4405, 4404, 4401]);

        vi.unstubAllGlobals();
    });
});
