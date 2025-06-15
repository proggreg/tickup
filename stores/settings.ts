export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  const pusherAppId = ref('')
  const pusherKey = ref('')
  const pusherSecret = ref('')
  const pusherCluster = ref('')
  const { getSession } = useAuth()

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
    const session = await getSession()
    const userId = session?.user?.sub
    const settings = await $fetch<Settings>('/api/settings', { query: { userId } })
    console.debug('get user settings', settings)
    if (settings.statuses.length) {
      userStatuses.value = settings.statuses
    }
    if (settings.pusherAppId) {
      pusherAppId.value = settings.pusherAppId
    }
    if (settings.pusherKey) {
      pusherKey.value = settings.pusherKey
    }
    if (settings.pusherSecret) {
      pusherSecret.value = settings.pusherSecret
    }
    if (settings.pusherCluster) {
      pusherCluster.value = settings.pusherCluster
    }
  }

  return { darkMode, statuses, getUserSettings, userStatuses, pusherAppId, pusherKey, pusherSecret, pusherCluster }
})
