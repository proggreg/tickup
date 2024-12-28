<script setup lang="ts">
const { status } = useAuth()
const colorMode = useColorMode()
const listStore = useListsStore()
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

router.beforeResolve((route) => {
  console.log('before route', route)
  if (route.name !== 'list-id' && route.name !== 'todo-id') {
    listStore.currentList.name = ''
  }
})

function addEventHandler() {
  if (route.name === 'lists') {
    dialog.value.page = 'lists'
  }
  else if (route.name === 'index') {
    dialog.value.page = 'index'
  }
  dialog.value.open = true
}
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app full-height>
        <v-layout>
          <v-main>
            <v-container class="fill-height align-start pb-16" fluid>
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
        <v-fab
          v-if="route.name === 'lists' || route.name === 'index'"
          location="bottom end"
          absolute
          size="large"
          style="margin-right: 1em; margin-bottom: 5em;"
          color="primary" icon="mdi-plus"
          variant="elevated" @click="addEventHandler"
        />
        <AppMobileNav v-if="status === 'authenticated'" />
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
