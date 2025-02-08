export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const results = reactive<Todo[]>([])

  function getUserId() {
    const { data: user } = useAuth()
    const userId = user.value?.user?.sub
    return userId
  }

  function search() {
    const userId = getUserId()
    console.log('searching for ', searchQuery)

    $fetch<Todo[]>('/api/search/vector', { query: { q: searchQuery.value, id: userId } })
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
