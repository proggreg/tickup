<script setup>
const colorMode = useColorMode()
const store = useListsStore()
const rename = ref(false)
const router = useRoute()
const input = ref(null)
const listName = computed(() => {
  return store?.currentList?.name || 'Today'
})

watch(rename, (newVal) => {
  if (!newVal) {
    if (!store.currentList._id) {
      store.currentList._id = router.params.id
    }

    store.updateList(store.currentList)
  }
  else {
    if (input.value) {
      input.value.focus()
    }
  }
})

watch(listName, (newName) => {
  if (store.lists.length && router.params.id && store.currentList.name.length > 0) {
    const list = store.lists.find(list => list._id === store.currentList._id)
    if (list) {
      list.name = newName
    }
  }
})
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app full-height>
        <AppToolbar />
        <AppNav />
        <v-main max-height="100vh">
          <v-container style="height: 100%;" fluid>
            <v-row style="height: 100%;">
              <v-col v-if="store.currentList.name" cols="12">
                <v-text-field
                  ref="input" v-model="store.currentList.name" :size="store.currentList.name.length + 1"
                  placeholder="My List" variant="plain" readonly
                  class="align-center font-weight-bold list-title" @keyup.enter="rename = false"
                  @blur="rename = false"
                >
                  <template v-if="router.params.id" #append>
                    <ListOptions :list-id="router.params.id" @rename="rename = true" />
                  </template>
                </v-text-field>
              </v-col>
              <AppSettings />

              <NuxtPage />
            </v-row>
          </v-container>
        </v-main>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>

<style></style>
