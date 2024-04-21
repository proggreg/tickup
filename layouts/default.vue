<script setup lang="ts">
const colorMode = useColorMode()
const { currentList, updateList } = useListsStore()
const rename = ref(false)
const { params } = useRoute()
const textFieldWidth = ref('100px')
const input = ref(null)

watch(rename, (newVal) => {
  console.log('watch rename', newVal)
  if (!newVal) {
    if (!currentList._id) {
      currentList._id = params.id
    }
    updateList(currentList)
  } else {
    if (!input.value) return
    input.value.focus()
    console.warn('no list id')
  }
})

watch(currentList.name, (newName) => {
  if (newName && newName.length > 10) {
    textFieldWidth.value = `${newName.length * 15}px`
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
                    <v-responsive class="mx-auto">
                      <v-text-field ref="input" full-width hide-details placeholder="My List" variant="plain"
                        :readonly="!rename" v-model="currentList.name" @keyup.enter="rename = false"
                        @blur="rename = false" autofocus>
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
