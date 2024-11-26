<script setup lang="ts">
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { $pwa } = useNuxtApp()
const route = useRoute()
const config = useRuntimeConfig()

if (status.value === 'authenticated') {
  await useAsyncData(() => settingsStore.getUserSettings().then(() => true))
  // @ts-expect-error
  listsStore.getLists(data?.value?.user?.sub)
  listsStore.getTodaysTodos(data?.value?.user?.sub)
} else {
  if (config.public.VERCEL_ENV === 'production' && !route.fullPath.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
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
