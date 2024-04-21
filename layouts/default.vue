<script setup lang="ts">
const colorMode = useColorMode()
const { currentList } = useListsStore()

console.log('current list', currentList)
</script>
<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container fluid>

              <NuxtErrorBoundary>
                <v-row class="fill-height">
                  <v-col>
                    <div class="d-flex align-center ga-2">
                      <h2 v-if="currentList.name">
                        {{ currentList.name }}
                      </h2>
                      <ListOptions />
                    </div>
                  </v-col>

                </v-row>
                <v-row>
                  <v-col cols="12">
                    <TodoNew />
                  </v-col>
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
