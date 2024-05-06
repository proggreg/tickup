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
                  <v-col>
                    <!-- TODO I would like to make this not full width but the size of name -->
                    <v-responsive inline min-width="200" class="mx-auto align-center">
                      <v-text-field :size="store.currentList.name.length" v-model="store.currentList.name"
                        placeholder="My List" variant="plain" :readonly="!rename" autofocus
                        @keyup.enter="rename = false" @blur="rename = false">
                        <template #append>
                          <ListOptions size="x-small" @rename="rename = true" />
                        </template>
                      </v-text-field>
                    </v-responsive>
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
