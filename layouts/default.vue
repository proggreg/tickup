<script setup lang="ts">
const colorMode = useColorMode()
const store = useListsStore()
const rename = ref(false)
const router = useRoute()
const input = ref(null)
const listName = computed(() => store.currentList.name)

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
  if (store.currentList.name.length > 0) {
    store.lists.find(list => list._id === store.currentList._id).name = newName
  }
})
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <app-nav />
          <v-main class="d-flex align-stretch justify-center">
            <v-container fluid>
              <NuxtErrorBoundary>
                <v-row>
                  <v-col cols="auto">
                    <v-text-field ref="input" v-model="store.currentList.name" :size="store.currentList.name.length"
                      placeholder="My List" variant="plain" density="compact" :readonly="!rename" :focused="rename"
                      center-afix class="align-center" @keyup.enter="rename = false" @blur="rename = false">
                      <template #append>
                        <ListOptions size="x-small" @rename="rename = true" />
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <TodoNew />
                  </v-col>
                </v-row>

                <template #error="{ error }">
                  <v-alert type="error">
                    {{ error }}
                  </v-alert>
                </template>
                <NuxtPage />
              </NuxtErrorBoundary>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
