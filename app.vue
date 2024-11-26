<script setup lang="ts">
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { $pwa } = useNuxtApp()
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
} else {
  console.log('redirecting to login', event?.headers.get('host'))
  if (config.public.VERCEL_ENV === 'production' && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    console.log('redirecting to login', event)
    // navigateTo('https://tickup.gregfield.dev/login', { external: true })
  }
}

if (route.params.id) {
  const { data: currentList } = await useFetch<List>(`/api/list/${route.params.id}`)
  if (currentList.value) {
    listsStore.setListName(currentList.value.name)
  }
}

</script>

<template>
  <div>
    <!-- <VitePwaManifest /> -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
