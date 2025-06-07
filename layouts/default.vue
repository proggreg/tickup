<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference" class="overflow-auto">
      <v-app full-height>
        <AppToolbar />
        <AppNav />
        <v-main>
          <v-container fluid class="pa-0" style="height: 100vh;">
            <AppSettings />

            <NuxtPage />
          </v-container>
        </v-main>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>
