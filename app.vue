<script setup lang="ts">
const listsStore = useListsStore()
// const settingsStore = useSettingsStore()
const { isMobile } = useDevice()
const route = useRoute()
const config = useRuntimeConfig()
const event = useRequestEvent()
const dialog = useDialog()

  if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true })
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
    <AppKeyCommands />
    <AppDialog page="todo" title="New Todo">
      <TodoNew @save-todo="dialog.open = false" />
      <template #buttons>
        <v-btn
          color="primary"
          :disabled="listsStore.newTodo.name === ''"
          @click.stop="dialog.open = false"
        >
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
