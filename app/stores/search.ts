import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', () => {
    const searchQuery = ref('');
    const results = reactive<Todo[]>([]);

    function search() {
    }
    const debouncedSearch = useDebounceFn(search, 500);

    return { results, search, debouncedSearch, searchQuery };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
