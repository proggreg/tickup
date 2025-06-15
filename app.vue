<script setup lang="ts">
const listsStore = useListsStore()
const settingsStore = useSettingsStore()
const { data, status } = useAuth()
const { isMobile } = useDevice()
const route = useRoute()
const config = useRuntimeConfig()
const event = useRequestEvent()
const dialog = useDialog()
const { $pwa } = useNuxtApp()

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

onBeforeMount(() => {
  const userId = data?.value?.user?.sub
  console.log('userId', userId)
  if (userId) {
    listsStore.getLists(userId)
  }

  if (route.params.id) {
    const { data: currentList } = useFetch<List>(`/api/list/${route.params.id}`)

    if (currentList.value) {
      listsStore.setCurrentList(currentList.value)
    }
  }
})

onMounted(() => {
  console.log('App mounted pwa ', $pwa)
  if ($pwa.offlineReady) {
    console.log('App ready to work offline')
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
    <NuxtPwaManifest />
    <AppKeyCommands />
    <!-- <div v-show="$pwa.needRefresh">
      <span>
        New content available, click on reload button to update.
      </span>

      <button @click="$pwa.updateServiceWorker()">
        Reload
      </button>
    </div> -->
    <AppDialog page="todo" title="New Todo">
      <TodoNew @save-todo="dialog.open = false" />
      <template #buttons>
        <v-btn color="primary" :disabled="listsStore.newTodo.name === ''" @click.stop="dialog.open = false">
          Save
        </v-btn>
      </template>
    </AppDialog>
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
