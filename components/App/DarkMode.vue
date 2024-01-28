<script setup lang="ts">
import { useTheme } from 'vuetify'
const theme = useTheme()

function toggleDarkMode () {
  theme.global.name.value = theme.global.name.value !== 'myCustomDarkTheme' ? 'myCustomDarkTheme' : 'myCustomLightTheme'   
}
</script>
<template>
  <v-btn
    variant="text"
    :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleDarkMode"
  />
</template>
