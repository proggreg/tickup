<script setup lang="ts">
const chatHistory = useChatHistory()
</script>

<template>
  <v-card
    v-for="message in chatHistory"
    :key="message"
    class="ma-8"
    variant="tonal"
  >
    <v-card-title>Gemini</v-card-title>
    <v-card-text>
      <pre style="white-space: pre-wrap;">{{ message }}</pre>
    </v-card-text>
  </v-card>
</template>
