export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  const { data } = useAuth()
  const userId = data.value?.user?.sub
  const userStatuses = ref([])

  const defaultStatuses = [
    {
      name: 'Open',
      color: '#87909e',
    }, {
      name: 'In Progress',
      color: '#ee5e99',
    }, {
      name: 'Closed',
      color: '#008844',
    }]
  
  
  const statuses = computed(() => {
    console.log('statuses', defaultStatuses)
    if (userStatuses.value.length) {
      return userStatuses.value
    }
    return defaultStatuses
  })

  async function getUserSettings() {
    const settings = await $fetch('/api/settings', { query: { userId } })
    if (settings.length) {
      userStatuses.value = settings[0].statuses
    }
    console.log('getUsersStatuses', settings)
    console.log('here', statuses)

    return true
  }

  return { darkMode, statuses, getUserSettings, userStatuses }
})
