export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  // const { getSession } = useAuth()

  const userStatuses = ref<Status[]>([])

  const defaultStatuses: Status[] = [
    {
      name: 'Open',
      color: '#87909e',
    },
    {
      name: 'In Progress',
      color: '#ee5e99',
    },
    {
      name: 'Closed',
      color: '#008844',
    },
  ]

  const statuses = computed((): Status[] => {
    if (userStatuses.value.length) {
      return userStatuses.value
    }
    return defaultStatuses
  })

  async function getUserSettings() {
    // const session = await getSession()
    // const userId = session?.user?.sub
    // const settings = await $fetch<Settings>('/api/settings', { query: { userId } })

    // if (settings.statuses.length) {
    //   userStatuses.value = settings.statuses
    // }
  }

  return { darkMode, statuses, getUserSettings, userStatuses }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
