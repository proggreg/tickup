export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)

  const statuses = ref([
    {
      name: 'Open',
      color: '#87909e',
      index: 0
    }, {
      name: 'In Progress',
      color: '#ee5e99',
      index: 1
    }, {
      name: 'Closed',
      color: '#008844',
      index: 2
    }])

  return { darkMode, statuses }
})
