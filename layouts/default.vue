<script setup lang="ts">
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
    const list = store.lists.find(list => list._id === store.currentList._id);
    if (list) {
      list.name = newName;
    }
  }
})

onBeforeMount(() => {
  console.log('before mount')
})
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <NuxtPwaManifest />
      <v-app>
        <v-layout>
          <app-nav />
          <v-main class="d-flex align-stretch justify-center">
            <v-container fluid>
              <!-- <NuxtErrorBoundary> -->
              <v-row v-if="store.currentList">
                <v-col cols="12">
                  <v-text-field ref="input" v-model="store.currentList.name" :size="store.currentList.name.length"
                    placeholder="My List" variant="plain" :focused="rename"
                    class="align-center font-weight-bold list-title" @keyup.enter="rename = false"
                    @blur="rename = false">
                    <template #append v-if="router.params.id">
                      <ListOptions :list-id="router.params.id" @rename="rename = true" />
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <TodoNew />
                </v-col>
              </v-row>
              <!-- <template #error="{ error }">
                  <v-alert type="error">
                    {{ error }}
                  </v-alert>
                </template> -->
              <NuxtPage />
              <!-- </NuxtErrorBoundary> -->
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
<style>
.list-title input {
  /* font-size: 1.5rem; */
}
</style>