<script setup lang="ts">
import { useListsStore } from '@/stores/lists'
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { $pwa } = useNuxtApp()
const route = useRoute()
await useAsyncData(() => settingsStore.getUserSettings().then(() => true))

if (status.value === 'authenticated') {
  // @ts-expect-error
  listsStore.getLists(data?.value?.user?.sub)
  listsStore.getTodaysTodos(data?.value?.user?.sub)
}

if (route.params.id) {
  const { data: currentList } = await useFetch<List>(`/api/list/${route.params.id}`)
  if (currentList.value) {
    listsStore.setListName(currentList.value.name)
  }
}


onMounted(() => {
  console.log('$pwa', $pwa)
  if ($pwa.offlineReady) {
    console.log('App ready to work offline')
  }
})
</script>

<template>
  <div>
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>