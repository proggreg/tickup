<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
const store = useSettingsStore()
await useAsyncData(() => store.getUserSettings().then(() => true))
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-center">Settings</h2>
      </v-col>
      <v-col cols="4">
        <SettingsTasks />
      </v-col>
    </v-row>
  </v-container>
</template>
