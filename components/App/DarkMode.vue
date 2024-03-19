<script setup lang="ts">
const colorMode = useColorMode()
function toggleDarkMode() {
  colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light'
}
</script>
<template>
  <v-btn
    variant="text"
    :icon="colorMode.preference === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleDarkMode"
  />
</template>
