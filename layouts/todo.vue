<script setup lang="ts">
const colorMode = useColorMode()
const listStore = useListsStore()
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container style="height: 100%" fluid>
              <v-row class="">
                <v-col cols="12">
                  <v-btn :to="listStore.currentTodo.listId ? `/list/${listStore.currentTodo.listId}`: `/`">
                    <template #prepend>
                      <v-icon>mdi-arrow-left</v-icon>
                    </template>
                    {{ listStore.currentList.name }}
                  </v-btn>
                </v-col>
                <NuxtPage />
              </v-row>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
