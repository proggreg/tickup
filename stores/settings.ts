import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  const { getSession } = useAuth()

  const userStatuses = ref<Status[]>([])
  const settings = ref<any>(null)

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
    const result = await $fetch<Settings>('/api/settings', { query: { userId } })
    settings.value = result
    if (result.statuses && result.statuses.length) {
      userStatuses.value = result.statuses
    }
  }

  async function updateSettings(newSettings: any) {
    const session = await getSession()
    const userId = session?.user?.sub
    const updated = await $fetch('/api/settings', {
      method: 'PUT',
      body: { userId, ...newSettings },
    })
    await getUserSettings()
    return updated
  }

  return { darkMode, statuses, getUserSettings, userStatuses, settings, updateSettings }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
