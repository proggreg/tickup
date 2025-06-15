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
  if (import.meta.client) {
    listsStore.$subscribe((mutation, state) => {
      localStorage.setItem('listState', JSON.stringify(state))
    })

    const cachedState = localStorage.getItem('listState')
    if (cachedState) {
      // listsStore.$state = JSON.parse(cachedState)
    }
  }

  await useAsyncData(() => settingsStore.getUserSettings().then(() => true))
  const userId = data?.value?.user?.sub
  if (userId) {
    listsStore.getLists(userId)
    listsStore.getTodaysTodos(userId)
    listsStore.getOverdueTodos(userId)
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
