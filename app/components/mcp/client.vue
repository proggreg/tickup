<script setup lang="ts">
import { Chat } from '@ai-sdk/vue';

const input = ref('');
const chat = new Chat({});

const message = `Create a todo called test ${new Date().toISOString()}`
const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value ? input.value : message });
  input.value = '';
};
</script>

<template>
  <div>
    <mcp-elicitation />

    <v-btn @click="chat.messages.length = 0">Clear Chat</v-btn>
    <div v-for="(m, index) in chat.messages" :key="m.id ? m.id : index">
      {{ m.role === "user" ? "User: " : "AI: " }}
      <div v-for="(part, index) in m.parts" :key="`${m.id}-${part.type}-${index}`">
        <div v-if="part.type === 'text'">
          {{ part.text }}
        </div>
        <div v-else-if="part.type === 'reasoning'">thinking{{ part.text }}</div>
        <div v-else-if="part.type === 'dynamic-tool'">thinking{{ part.toolName }}</div>
      </div>
    </div>



    <form @submit="handleSubmit">
      <v-text-field v-model="input" :placeholder="message" />
    </form>
  </div>
</template>
