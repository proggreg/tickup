export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  const { getSession } = useAuth()

  const userStatuses = ref<Status[]>([])

  const defaultStatuses = [
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

  const statuses = computed(() => {
    if (userStatuses.value.length) {
      return userStatuses.value
    }
    return defaultStatuses
  })

  async function getUserSettings() {
    const session = await getSession()
    const userId = session?.user?.sub
    const settings = await $fetch<Settings>('/api/settings', { query: { userId } })
    console.debug('get user settings', settings)
    if (settings.statuses.length) {
      userStatuses.value = settings.statuses
    }
  }

  return { darkMode, statuses, getUserSettings, userStatuses }
})
