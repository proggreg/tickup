<script setup lang="ts">
  const listsStore = useListsStore()
  const settingsStore = useSettingsStore()
  const { data, status } = useAuth()
  const config = useRuntimeConfig()
  const event = useRequestEvent()
  
  useShortcutKeys()

if (status.value === 'authenticated') {
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
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
  }
}
if (data?.value?.user?.sub) {
  await useAsyncData('lists', () => listsStore.getLists(data?.value?.user?.sub ? data?.value?.user?.sub : '').then(() => true))
}

</script>

<template>
  <div>
    <NuxtPwaManifest />   
    <AppDialog page="todo" title="New Todo">
      <TodoNew />
      <template #buttons>
        <v-btn color="primary" :disabled="listsStore.newTodo.name === ''">
          Save
        </v-btn>
      </template> 
    </AppDialog>
    <NuxtLayout :name="useAppLayout()">
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
