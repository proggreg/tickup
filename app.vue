<script setup lang="ts">
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { $pwa } = useNuxtApp()
const route = useRoute()

if (status.value === 'authenticated') {
  await useAsyncData(() => settingsStore.getUserSettings().then(() => true))
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

</script>

<template>
  <div>
    <!-- <VitePwaManifest /> -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
