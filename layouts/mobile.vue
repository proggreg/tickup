<script setup lang="ts">
const colorMode = useColorMode()

</script>

<template>
  <ColorScheme>
    <v-theme-provider with-background :theme="colorMode.preference">
      <v-app>
        <v-layout>
          <AppMobileNav />
          <v-main class="d-flex align-stretch justify-center">
            <v-container fluid>
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </ColorScheme>
</template>