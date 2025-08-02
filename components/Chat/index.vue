<script setup lang="ts">
import ollama from 'ollama/browser'

type Role = 'AI' | 'user'

interface Message {
  role: Role
  content: string
}
const models = ['deepseek-r1:1.5b', 'deepseek-r1:14b']
const chatMessages = reactive<{ text: string, sender: string }[]>([])
const prompt = ref('')
const chatResponse = ref('')
const messages: Message[] = []
const loading = ref(false)
const selectedModel = ref(models[0])
const listsStore = useListsStore()

function sendMessage(message: string) {
  loading.value = true

  message += 'here is a array of todos ' + JSON.stringify(listsStore.currentList.todos)

  chatMessages.push({ text: message, sender: 'user' })
  messages.push({ role: 'user', content: message })
  let tmpchatResponse = ''

  ollama.chat({
    model: selectedModel.value,
    messages: messages,
    stream: true 
  }).then(async (response) => {
      
      for await (const part of response) {
        chatResponse.value += part.message.content
        tmpchatResponse += part.message.content
      }

      messages.push({ role: 'AI', content: tmpchatResponse })
      chatMessages.push({ text: tmpchatResponse, sender: 'AI' })
      chatResponse.value = ''
      loading.value = false
    })

  prompt.value = ''
}
</script>

<template>
  <div>
    <NuxtErrorBoundary>
      <div v-for="(message, index) in chatMessages" :key="index">
        <p v-if="message.sender === 'user'">{{ message.text }}</p>
        <p v-else-if="message.sender === 'AI'">{{ message.text }}</p>
      </div>
      <p>{{ chatResponse }}</p>
      <v-text-field
        v-model="prompt" type="text" placeholder="Type a message..."
        :disabled="loading"
        @keyup.enter="sendMessage(prompt)"
      >
        <template #append>
          <v-select v-model="selectedModel" :items="models" />
        </template>
      </v-text-field>

      <template #error="{ error }">
        <div>
          <p>An error occurred:</p>
          <code>{{ error }}</code>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>

<style scoped></style>
