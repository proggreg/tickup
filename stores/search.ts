export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const results = reactive<Todo[]>([])

  function search() {
    console.log('searching for ', searchQuery)

    $fetch<Todo[]>('/api/search/todo', { query: { q: searchQuery.value } })
      .then((res) => {
        results.splice(0, results.length, ...res)
        console.log('got results ', results)
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const debouncedSearch = useDebounceFn(search, 500)

  return { results, search, debouncedSearch, searchQuery }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot))
}
