<script setup lang="ts">
  const listsStore = useListsStore()
  const settingsStore = useSettingsStore()
  const { userId, isAuthenticated } = useCurrentUser()
  const config = useRuntimeConfig()
  const event = useRequestEvent()

  useShortcutKeys()

if (isAuthenticated.value) {
  await useAsyncData(() => settingsStore.getUserSettings().then(() => true))

  if (userId.value) {
    listsStore.getLists(userId.value)
    listsStore.getTodaysTodos(userId.value)
    listsStore.getOverdueTodos(userId.value)
  }
}
else {
  if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
  }
}
if (userId.value) {
  await useAsyncData('lists', () => listsStore.getLists(userId.value).then(() => true))
}
</script>

<template>
  <div>
    <!-- <NuxtPwaManifest /> -->
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
