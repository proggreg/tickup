<script setup lang="ts">
const prompt = ref('')
const response = ref('')
const loading = ref(false)
const error = ref('')

async function sendPrompt() {
  error.value = ''
  response.value = ''
  loading.value = true
  try {
    const { data, error } = await useFetch('/api/gemini', {
      method: 'POST',
      body: { prompt: prompt.value },
    })
    console.log('error', error)
    if (error.value) {
      throw error.value
    }
    else {
      response.value = typeof data.value === 'string' ? data.value : JSON.stringify(data.value)
    }
  }
  catch (e) {
    error.value = 'Failed to fetch Gemini response.'
  }
  loading.value = false
}
</script>

<template>
  <v-card class="mx-auto my-8 bg-pink" max-width="100%">
    <v-card-title>
      Gemini Prompt
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="prompt"
        label="Enter your prompt"
        outlined
        dense
        @keyup.enter="sendPrompt"
      />
      <v-btn
        :loading="loading"
        color="primary"
        class="mt-2"
        block
        @click="sendPrompt"
      >
        Send
      </v-btn>
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        dense
      >
        {{ error }}
      </v-alert>
      <v-card
        v-if="response"
        class="mt-4"
        variant="tonal"
      >
        <v-card-title>Response</v-card-title>
        <v-card-text>
          <pre style="white-space: pre-wrap;">{{ response }}</pre>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>
