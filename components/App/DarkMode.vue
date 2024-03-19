<script setup lang="ts">
const theme = useTheme()
const colorMode = useColorMode()
function toggleDarkMode() {
  colorMode.preference = colorMode.preference === 'light' ? 'dark' : 'light'
}
</script>
<template>
  <v-btn
    variant="text"
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleDarkMode"
  />
</template>
