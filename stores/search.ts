export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const results = reactive<Todo[]>([])

  function search() {
    // const { userId } = useCurrentUser()

    // $fetch<Todo[]>('/api/search/todo', { query: { q: searchQuery.value, id: userId.value } })
    //   .then((res) => {
    //     results.splice(0, results.length, ...res)
    //   })
    //   .catch((err) => {
    //     logger.error(err as Error, { component: 'SearchStore', function: 'search', query: searchQuery.value })
    //   })
  }
  const debouncedSearch = useDebounceFn(search, 500)

  return { results, search, debouncedSearch, searchQuery }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot))
}
