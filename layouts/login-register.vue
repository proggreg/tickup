<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container class="fill-height flex justify-center">
              <v-sheet>
                <h1 class="text-center py-4">
                  TickUp
                </h1>
                <NuxtPage />
              </v-sheet>
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
