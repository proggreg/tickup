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
    <v-theme-provider
      with-background
      :theme="colorMode.preference"
    >
      <v-app>
        <BoardToolbar />
        <v-layout>
          <AppNav />
          <AppMobileNav />
          <v-main>
            <v-container
              class="align-start"
              style="height: 100%;"
            >
              <NuxtErrorBoundary>
                <v-row
                  class=""
                  style="height: 100%;"
                >
                  <!-- <v-row
                  v-if="store.currentList"
                  class="bg-red"
                >
                  <v-text-field
                    ref="input"
                    v-model="store.currentList.name"
                    :size="store.currentList.name.length"
                    placeholder="My List"
                    variant="plain"
                    :focused="rename"
                    class="align-center font-weight-bold list-title"
                    @keyup.enter="rename = false"
                    @blur="rename = false"
                  >
                    <template
                      v-if="router.params.id"
                      #append
                    >
                      <ListOptions
                        :list-id="router.params.id"
                        @rename="rename = true"
                      />
                    </template>
                  </v-text-field>
                  <v-col cols="12">
                    <TodoNew />
                  </v-col>
                </v-row> -->
                  <AppSettings />
                  <template #error="{ error }">
                    <v-alert type="error">
                      {{ error }}
                    </v-alert>
                  </template>
                  <NuxtPage />
                </v-row>
              </NuxtErrorBoundary>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>

<style></style>
