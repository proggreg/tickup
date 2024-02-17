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
  <v-app-bar
    density="comfortable"
    height="70"
    elevation="0"
    align-center
    class="d-flex justify-space-between"
    style="justify-content: space-between; border-top: none; border-left: none; border-right: none;"
  >
    <template
      v-if="loggedIn"
      #prepend
    >
      <v-btn
        v-if="smAndDown"
        size="small"
        style="padding: 0;"
        elevation="0"
        @click="open = !open"
      >
        <v-icon
          class="text-h4"
          size="x-large"
        >
          mdi-menu
        </v-icon>
      </v-btn>
      <AppProfile v-else />
    </template>
    <AppSearch v-if="loggedIn" />

    <template #append>
      <v-btn
        v-if="loggedIn && !smAndDown"
        size="small"
        style="padding: 0;"
        elevation="0"
        @click="signOut()"
      >
        Sign Out
      </v-btn>
      <AppDarkMode />
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-if="loggedIn"
    v-model="open"
    class="pa-2"
    :permanent="!smAndDown"
  >
    <v-list>
      <v-spacer />
      <v-btn
        elevation="0"
        rounded="lg"
        append-icon="mdi-home"
        width="100%"
        to="/"
        @click="closeDrawer"
      >
        Home
      </v-btn>

      <v-list-item>
        <template #append>
          <v-btn
            elevation="0"
            rounded="lg"
            icon="mdi-plus"
            @click="dialog = true"
          />
        </template>
        <template #prepend>
          <ListNew
            :open="dialog"
            @close="dialog = false"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-divider />
    <AppNavItems />

    <template #append>
      <div v-if="smAndDown" class="pa-2">
        <AppProfile />
      </div>
    </template>

  </v-navigation-drawer>
</template>
