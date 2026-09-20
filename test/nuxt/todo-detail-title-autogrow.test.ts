import { describe, expect, it } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { createVuetify } from 'vuetify';
import TodoDetail from '../../app/components/Todo/Detail.vue';
import { useListsStore } from '../../app/stores/lists';

registerEndpoint('/api/github/check', () => false);
registerEndpoint('/api/vercel/check', () => false);

describe('TodoDetail title field', () => {
    it('renders the title as an auto-grow textarea so long titles wrap instead of clipping', async () => {
        setActivePinia(createPinia());
        const listsStore = useListsStore();
        listsStore.currentTodo = { id: '1', name: 'A very long todo title' } as Task;

        const wrapper = await mountSuspended(TodoDetail, {
            global: {
                plugins: [createVuetify()],
                stubs: { SubtaskItems: true, TodoLinks: true, AppDueDate: true },
            },
        });

        const title = wrapper.get('[data-testid="todo-detail-title"]');
        expect(title.classes()).toContain('v-textarea--auto-grow');
    });
});
