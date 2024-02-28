<script setup lang="ts">
const theme = useTheme()
onMounted(() => {
  const dark = localStorage.getItem('dark')
  if (dark) {
    theme.global.name.value = dark
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.global.name.value = 'dark'
  }
})

</script>
<template>
  <main>
    <v-theme-provider with-background>
      <v-app>
        <v-layout>
          <app-nav />
          <v-main>
            <v-container class="fill-height flex justify-center">
              <NuxtPage />
            </v-container>
          </v-main>
        </v-layout>
      </v-app>
    </v-theme-provider>
  </main>
</template>
