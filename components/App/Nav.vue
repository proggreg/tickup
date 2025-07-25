<script setup lang="ts">
const open = useNav()
const dialog = useDialog()
const { smAndDown } = useDisplay()
const { signOut, status } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')
const contextMenuOpen = ref(false)
const menuTarget = ref([])
const selectedList = ref<List>()
const listsStore = useListsStore()
function openContextMenu(event: MouseEvent, list: List) {
  contextMenuOpen.value = true
  menuTarget.value = [event.clientX, event.clientY]
  selectedList.value = list
}

function deleteList() {
  contextMenuOpen.value = false
  menuTarget.value = []
  if (!selectedList.value || !selectedList.value._id) {
    console.warn('No list selected')
    return
  }
  listsStore.deleteList(selectedList.value._id)
}
</script>

<template>
  <v-app-bar v-if="!smAndDown" extension-height="0">
    <template #prepend>
      <v-img class="pa-6" src="/android-chrome-512x512.png" width="40" style="border-radius: 50%" />

      <template v-if="loggedIn">
        <div class="ml-6" style="display: flex; justify-content: space-between;">
          <v-btn v-if="smAndDown" size="small" style="padding: 0;" elevation="0" @click="open = !open">
            <v-icon class="text-h4" size="x-large">
              mdi-menu
            </v-icon>
          </v-btn>
          <v-btn variant="plain" icon="mdi-home" to="/" />
          <v-btn variant="plain" icon="mdi-cog" to="/settings" />
          <v-btn variant="plain" icon="mdi-plus" data-testid="new-list-button" @click="dialog.page = 'list';dialog.open = true;" />
        </div>
      </template>

      <template v-else>
        <v-img src="/android-chrome-512x512.png" width="50" style="border-radius: 50%" />
      </template>
    </template>

    <Search />

    <template #append>
      <AppDarkMode />
    </template>
    <template #extension>
      <v-divider />
    </template>
  </v-app-bar>

  <v-navigation-drawer v-if="loggedIn" v-model="open" style="max-height: 100vh; overflow-y: hidden !important;" disable-resize-watcher class="font-weight-bold" :permanent="!smAndDown" height="100vh">
    <v-list nav>
      <!-- <v-spacer /> -->
      <!-- <v-btn variant="plain" icon="mdi-home" to="/" />
      <v-btn variant="plain" icon="mdi-plus" @click="dialog.page = 'list';dialog.open = true;" /> -->
      <ListNew :open="dialog" @close="dialog.open = false" />
      <!-- <v-list-item to="/" class="text-h5 text-sm-h6 text-capitalize  nav-item-title" prepend-icon="mdi-home" />
      <v-list-item prepend-icon="mdi-plus" class="text-h5 text-sm-h6 text-capitalize  nav-item-title" @click="dialog.page = 'list';dialog.open = true;">
        <ListNew :open="dialog" @close="dialog.open = false" />
      </v-list-item> -->
      <!-- <v-divider class="mb-1" /> -->
      <AppNavItems @open="openContextMenu" />
    </v-list>

    <v-menu v-if="menuTarget" v-model="contextMenuOpen" :target="menuTarget" location-strategy="connected">
      <v-list nav>
        <v-list-item>
          <v-btn variant="text" color="red" icon="mdi-trash-can" @click="deleteList" />
        </v-list-item>
      </v-list>
    </v-menu>

    <template #append>
      <div v-if="smAndDown" class="pa-2 d-flex flex-column ga-2">
        <v-btn v-if="loggedIn" size="small" style="padding: 0;" variant="elevated" height="36" block @click="signOut()">
          Sign Out
        </v-btn>
        <AppMenu />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.nav-item-title {
  text-transform: capitalize !important;
  font-weight: bold;
  @media (min-width: 600px) {
    font-size: 1rem !important;
   }
}

:deep(.v-navigation-drawer__content) {
  overflow-y: hidden !important;
}

:deep(.v-list-item-title) {
  text-transform: capitalize !important;
  font-weight: bold;
}
</style>
