<script setup lang="ts">
const colorMode = useColorMode()
const store = useListsStore()
const rename = ref(false)
const { params } = useRoute()
watch(rename, (newVal) => {
  if (!newVal) {
    if (!store.currentList._id) {
      store.currentList._id = params.id
    }
    // debugger
    store.lists.find((list) => list._id === store.currentList._id).name = store.currentList.name
    store.updateList(store.currentList)
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
                    <v-text-field :size="store.currentList.name.length" v-model="store.currentList.name"
                      placeholder="My List" variant="plain" density="compact" :readonly="!rename" autofocus single-line
                      @keyup.enter="rename = false" @blur="rename = false" center-afix class="align-center">
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
                <v-row>
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

<style scoped>
::v-deep .v-text-field {
  font-size: 1.5rem;
}
</style>
