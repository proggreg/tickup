<script setup lang="ts">
const colorMode = useColorMode()
const listStore = useListsStore()
const route = useRoute()

onBeforeUpdate(() => {
  console.log('route', route)
  console.log('route name', route.name)

  if (route.name !== 'list-id') {
    listStore.currentList.name = ''
  }
})
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout full-height>
          <v-main>
            <v-container class="fill-height align-start pb-16" fluid>
              <v-col v-if="listStore.currentList.name && listStore.currentTodo.listId" cols="12">
                <v-btn :to="`/list/${listStore.currentTodo.listId}`" :text="listStore.currentList.name" prepend-icon="mdi-arrow-left" />
              </v-col>
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
        <AppMobileNav />
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
