<script setup lang="ts">
const theme = useTheme()

function toggleDarkMode() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('dark', theme.global.name.value)

}
</script>
<template>
  <v-btn
    variant="text"
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleDarkMode"
  />
</template>
