<script setup lang="ts">
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { isMobile } = useDevice()
// const { $pwa } = useNuxtApp()
const route = useRoute()
const config = useRuntimeConfig()
const event = useRequestEvent()

if (status.value === 'authenticated') {
  await useAsyncData(() => settingsStore.getUserSettings().then(() => true))

  // if (userId) {
  //   listsStore.getLists(userId)
  //   listsStore.getTodaysTodos(userId)
  //   listsStore.getOverdueTodos(userId)
  // }
}
else {
  if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
  }
}
if (data?.value?.user?.sub) {
  await useAsyncData('lists', () => listsStore.getLists(data?.value?.user?.sub ? data?.value?.user?.sub : '').then(() => true))
}

onBeforeMount(() => {
  const userId = data?.value?.user?.sub
  console.log('userId', userId)
  if (userId) {
    // listsStore.getLists(userId)
  }

  if (route.params.id) {
    const { data: currentList } = useFetch<List>(`/api/list/${route.params.id}`)

    if (currentList.value) {
      listsStore.setCurrentList(currentList.value)
    }
  }
})
const layoutName = computed(() => {
  if (route.name === 'login' || route.name === 'register') {
    return 'login-register'
  }
  if (isMobile) {
    return 'mobile'
  }
  if (route.name === 'todo-id') {
    return 'todo'
  }

  return 'default'
})
</script>

<template>
  <div>
    <VitePwaManifest />
    <NuxtLayout :name="layoutName">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
  filter: grayscale(1);
}
</style>
