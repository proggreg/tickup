import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AppDueDate from '../../app/components/App/DueDate.vue';

// Regression test for the "yesterday's due date shows as today" bug.
//
// Due dates used to be stored as browser-local midnight converted to a UTC
// instant. In a positive-UTC-offset timezone (e.g. BST, UTC+1), picking
// "today" produced a due_date whose raw calendar day is *yesterday* in UTC
// (23:00 the previous day) - so anything reading the raw date disagreed with
// the app's own "today" classification. The fix stores/reads due dates by
// their UTC calendar day, independent of the viewer's timezone.
describe('AppDueDate - UTC-normalized due dates', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-08-09T10:00:00.000Z'));
        vi.stubEnv('TZ', 'Europe/London'); // BST (UTC+1) in August
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('labels a due date whose UTC calendar day is yesterday as "Yesterday", not "Today"', async () => {
        // Exactly what the old local-midnight picker produced for "today" in BST:
        // 2026-08-08T23:00:00Z is BST-local midnight of Aug 9, but its raw UTC
        // calendar day is Aug 8.
        const wrapper = await mountSuspended(AppDueDate, {
            props: {
                todo: {} as Task,
                todoDueDate: '2026-08-08T23:00:00.000Z',
            },
        });

        expect(wrapper.text()).toContain('Yesterday');
        expect(wrapper.text()).not.toContain('Today');
    });

    it('labels a due date whose UTC calendar day matches today as "Today"', async () => {
        const wrapper = await mountSuspended(AppDueDate, {
            props: {
                todo: {} as Task,
                todoDueDate: '2026-08-09T00:00:00.000Z',
            },
        });

        expect(wrapper.text()).toContain('Today');
    });

    it('stores a picked date as pure UTC midnight, not local midnight', async () => {
        const wrapper = await mountSuspended(AppDueDate, {
            props: { todo: {} as Task },
        });

        await wrapper.find('[data-testid="due-date-trigger"]').trigger('click');
        await wrapper.vm.$nextTick();

        const quicks = Array.from(document.querySelectorAll('.due-quick')) as HTMLElement[];
        const todayQuick = quicks.find(btn => btn.textContent?.includes('Today'));
        expect(todayQuick).toBeTruthy();
        todayQuick!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted('setDate');
        expect(emitted).toBeTruthy();
        const emittedDate = emitted![0][0] as Date;
        expect(emittedDate.toISOString()).toBe('2026-08-09T00:00:00.000Z');
    });
});
