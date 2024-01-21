<script setup lang="ts">
const theme = ref('myCustomLightTheme')
useBugsnag().notify('Some Error')

</script>
<template>
  <main>
    <v-theme-provider
      :theme="theme"
      with-background
    >
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container>
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </main>
</template>
