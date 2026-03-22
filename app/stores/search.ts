import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', () => {
    const searchQuery = ref('');
    const results = ref<Todo[]>([]);
    const loading = ref(false);

    async function search() {
        loading.value = true;
        try {
            const todos = await $fetch<Todo[]>('/api/search/todo', {
                method: 'POST',
                body: {
                    query: searchQuery.value,
                },
            });
            results.value = todos;
        }
        finally {
            loading.value = false;
        }
    }
    const debouncedSearch = useDebounceFn(search, 500);

    return { results, loading, search, debouncedSearch, searchQuery };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
