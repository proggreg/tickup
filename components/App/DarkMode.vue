<script setup lang="ts">
import { useTheme } from 'vuetify'
const theme = useTheme()

function toggleDarkMode () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>
<template>
  <v-btn variant="text" :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleDarkMode" />
</template>
