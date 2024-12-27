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
  const userId = data?.value?.user?.sub
  if (userId) {
    listsStore.getLists(userId)
    listsStore.getTodaysTodos(userId)
  }
}
else {
  if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    console.log('host', event?.headers.get('host'))
    console.log('should redirect', !event?.headers.get('host')?.includes('tickup.gregfield.dev'))
    console.log('redirecting to login', 'https://tickup.gregfield.dev/login')
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
  }
}

if (route.params.id) {
  const { data: currentList } = await useFetch<List>(`/api/list/${route.params.id}`)
  if (currentList.value) {
    listsStore.setListName(currentList.value.name)
  }
}

const layoutName = computed(() => {
  if (isMobile) {
    return 'mobile'
  }
  console.log('route name', route.name)
  if (route.name === 'todo-id') {
    return 'todo'
  }

  return 'default'
})
</script>

<template>
  <div>
    <!-- <VitePwaManifest /> -->
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
