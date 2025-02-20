<script setup lang="ts">
const { status } = useAuth()
const colorMode = useColorMode()
const route = useRoute()
const dialog = useDialog()

function addEventHandler() {
  if (route.name === 'lists') {
    dialog.value.page = 'list'
  }
  else if (route.name === 'index' || route.name === 'list-id') {
    dialog.value.page = 'todo'
  }

  console.log('addEventHandler', dialog.value.page)
  dialog.value.open = true
}

const showFab = computed(() => {
  return route.name === 'lists' || route.name === 'list-id' || route.name === 'index'
})
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <v-main>
            <v-container class="align-start pa-0" fluid>
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
        <div style="position: fixed; z-index: 99999; background-color: red; width: 100%; height: 0; bottom: 100px">
          <v-fab
            v-if="showFab"
            position="static"
            size="small"
            style="position: absolute; right: 80px; bottom: -20px"
            color="primary" append-icon="mdi-plus"
            variant="elevated" @click="addEventHandler"
          >
            New
          </v-fab>
        </div>

        <AppMobileNav v-if="status === 'authenticated'" />
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
