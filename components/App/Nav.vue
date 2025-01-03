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
      <template v-if="loggedIn">
        <v-btn v-if="smAndDown" size="small" style="padding: 0;" elevation="0" @click="open = !open">
          <v-icon class="text-h4" size="x-large">
            mdi-menu
          </v-icon>
        </v-btn>
        <AppMenu v-else />
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

  <v-navigation-drawer v-if="loggedIn" v-model="open" class="pa-2 font-weight-bold" :permanent="!smAndDown">
    <v-list nav>
      <v-spacer />
      <v-list-item>
        <template #prepend>
          Home
        </template>
        <template #append>
          <v-btn icon="mdi-home" to="/" />
        </template>
      </v-list-item>
      <v-list-item>
        <div class="d-flex justify-space-between">
          Lists
        </div>
        <template #prepend>
          <ListNew :open="dialog" @close="dialog.open = false" />
        </template>
        <template #append>
          <v-btn icon="mdi-plus" @click="dialog.open = true; console.log('clicked')" />
        </template>
      </v-list-item>
    </v-list>
    <v-divider />
    <AppNavItems @open="openContextMenu" />

    <v-menu v-if="menuTarget" v-model="contextMenuOpen" :target="menuTarget" location-strategy="connected">
      <v-list>
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
