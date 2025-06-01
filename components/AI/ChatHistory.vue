<script setup lang="ts">
const chatHistory = useChatHistory()
</script>

<template>
  <v-card
    v-for="(history, index) in chatHistory"
    :key="index"
    class="mt-4"
    variant="tonal"
  >
    <v-card-title>{{ history.role }}</v-card-title>
    <v-card-text v-for="part in history.parts">
      <pre style="white-space: pre-wrap;">{{ part.text }}</pre>
    </v-card-text>
  </v-card>
</template>
