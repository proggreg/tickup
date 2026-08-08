import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', () => {
    const searchQuery = ref('');
    const results = ref<Task[]>([]);
    const loading = ref(false);
    const selectedListId = ref<string | null>(null);

    const availableLists = computed(() => {
        const seen = new Set<string>();
        return results.value
            .filter((todo) => todo.list?.id)
            .reduce<List[]>((acc, todo) => {
                if (!seen.has(todo.list!.id!)) {
                    seen.add(todo.list!.id!);
                    acc.push(todo.list!);
                }
                return acc;
            }, []);
    });

    const filteredResults = computed(() => {
        if (!selectedListId.value) return results.value;
        return results.value.filter((todo) => todo.listId === selectedListId.value);
    });

    async function search() {
        loading.value = true;
        try {
            const todos = await $fetch<Task[]>('/api/search/todo', {
                method: 'POST',
                body: {
                    query: searchQuery.value,
                },
            });
            results.value = todos;
        } finally {
            loading.value = false;
        }
    }
    const debouncedSearch = useDebounceFn(search, 500);

    function selectList(listId: string | null) {
        selectedListId.value = selectedListId.value === listId ? null : listId;
    }

    return {
        results,
        filteredResults,
        availableLists,
        selectedListId,
        loading,
        search,
        debouncedSearch,
        searchQuery,
        selectList,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
