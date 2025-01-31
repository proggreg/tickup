<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference" class="overflow-auto">
      <v-app full-height>
        <AppToolbar />
        <AppNav />
        <v-main max-height="100vh">
          <v-container style="height: 100%;" fluid>
            <v-row style="height: 100%;">
              <AppSettings />

              <NuxtPage />
            </v-row>
          </v-container>
        </v-main>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>

<style></style>
