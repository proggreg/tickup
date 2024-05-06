<script setup lang="ts">
const open = useNav()
const dialog = ref(false)
const { smAndDown } = useDisplay()
const { signOut, status } = useAuth()
const loggedIn = computed(() => status.value === 'authenticated')

function closeDrawer() {
  if (smAndDown.value) {
    open.value = false
  }
}

</script>

<template>
  <v-app-bar>
    <template v-if="loggedIn" #prepend>
      <v-btn v-if="smAndDown" size="small" style="padding: 0;" elevation="0" @click="open = !open">
        <v-icon class="text-h4" size="x-large">
          mdi-menu
        </v-icon>
      </v-btn>
      <AppMenu v-else />
    </template>
    <template v-if="!loggedIn" #prepend>
      <v-img src="/android-chrome-512x512.png" width="50" style="border-radius: 50%" />
    </template>
    <AppSearch v-if="loggedIn" />

    <template #append>
      <AppDarkMode />
    </template>
  </v-app-bar>

  <v-navigation-drawer v-if="loggedIn" v-model="open" class="pa-2" :permanent="!smAndDown" width="400">
    <v-list>
      <v-spacer />
      <v-list-item nav link append-icon="mdi-home">
        Home
      </v-list-item>
      <v-list-item link>
        <template #prepend>
          <ListNew :open="dialog" @close="dialog = false" />
        </template>
        <template #append>
          <v-icon elevation="0" icon="mdi-plus" @click="dialog = true" />
        </template>
      </v-list-item>
    </v-list>
    <v-divider />
    <AppNavItems />

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
