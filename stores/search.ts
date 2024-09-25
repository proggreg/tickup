export const useSearchStore = defineStore("search", () => {
	const query = ref("");
	const results = ref([]);
	watch(query, async (newQuery) => {
		const { data: user } = useAuth();
		const userId = user.value?.user?.sub;
		const data = await $fetch("/api/search/todo", {
			query: { q: newQuery, id: userId },
		});
		results.value = data;
	});

	function search(query, userId) {
		$fetch("/api/search/todo", { query: { q: query, id: userId } })
			.then((res) => {
				items.value = res;
			})
			.catch((err) => {
				results.value = err;
			});
	}
	const debouncedSearch = useDebounceFn(search, 500);

	return { results, search, debouncedSearch, query };
});
