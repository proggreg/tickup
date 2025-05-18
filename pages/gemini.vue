<template>
  <div>
    <h1>Gemini Prompt</h1>
    <form @submit.prevent="sendPrompt">
      <input v-model="prompt" placeholder="Enter your prompt">
      <button type="submit">Send</button>
    </form>
    <div v-if="response">
      <h2>Response:</h2>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script setup>
const prompt = ref('')
const response = ref(null)

async function sendPrompt() {
  const { data } = await useFetch('/api/gemini', {
    method: 'POST',
    body: { prompt: prompt.value },
  })
  response.value = data.value
}
</script>
