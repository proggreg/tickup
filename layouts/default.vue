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
            <v-container
              fluid
            >
            <v-row class="fill-height">
              <v-col cols="12">
                <h2>{{ listStore.currentList.name }}</h2>
              </v-col>
              <v-col cols="12">
              <TodoNew />
            </v-col> 
              <v-col cols="12">
                <NuxtPage />
              </v-col>
            </v-row>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
