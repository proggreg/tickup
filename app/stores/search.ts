import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', () => {
    const searchQuery = ref('');
    const results = ref<Todo[]>([]);

    async function search() {
        const todos = await $fetch<Todo[]>('/api/search/todo', {
            method: 'POST',
            body: {
                query: searchQuery.value,
            },
        });

        results.value = todos;
    }
    const debouncedSearch = useDebounceFn(search, 500);

    return { results, search, debouncedSearch, searchQuery };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
