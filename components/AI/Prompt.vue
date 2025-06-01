<script setup lang="ts">
const prompt = ref('')
</script>

<template>
  <v-card title="Prompt" color="transparent">
    <v-card-text>
      <v-textarea
        v-model="prompt"
        label="Enter your prompt"
        outlined
        auto-grow
        dense
      />
      <slot />
    </v-card-text>
  </v-card>
</template>
