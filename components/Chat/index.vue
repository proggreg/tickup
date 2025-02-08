<script setup lang="ts">
import ollama from 'ollama/browser'

const models = ['deepseek-r1:1.5b', 'deepseek-r1:14b']
const chatMessages = reactive<{ text: string, sender: string }[]>([])
const prompt = ref('')
const chatResponse = ref('')
const messages = []
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
    stream: true })
    .then(async (response) => {
      console.log('response', response)
      for await (const part of response) {
        chatResponse.value += part.message.content
        tmpchatResponse += part.message.content
      }
      messages.push({ role: 'AI', content: tmpchatResponse })

      console.log('now here')
      chatMessages.push({ text: tmpchatResponse, sender: 'AI' })
      chatResponse.value = ''
      loading.value = false
    })

  prompt.value = ''
}
</script>

<template>
  <div>
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
  </div>
</template>

<style scoped>
/* input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
} */
</style>
