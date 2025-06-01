<script setup lang="ts">
import Pusher from 'pusher-js'
const router = useRouter()
const taskName = ref('')
const cron = ref('*/10 * * * * *')
const runtimeConfig = useRuntimeConfig()

const error = ref('')
const prompt = ref('what are the most popular things to watch, get your information from rotten tomatoes. Only list the films and tv shows')
onMounted(() => {
  Pusher.logToConsole = true

  if (!runtimeConfig.public.PUSHER_KEY) {
    console.warn('PUSHER_KEY not set')
    return
  }
  const pusher = new Pusher(runtimeConfig.public.PUSHER_KEY, {
    cluster: 'eu',
  })

  const channel = pusher.subscribe('my-channel')
  channel.bind('prompt', function (data: any) {
    alert(JSON.stringify(data))
  })
})





const saveSchedule = async () => {
  if (!cron.value) {
    throw Error('schedule required')
  }

  try {
    const response = await $fetch<Task | {error: string}>('/api/tasks/save', {
      method: 'POST',
      body: {
        name: taskName.value,
        cron: cron.value,
        prompt: prompt.value,
      },
    })

    if ('error' in response) {
      error.value = response.error
    }
  }
  catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = 'An unknown error occurred'
    }
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Configure Schedule</v-card-title>
          <v-card-text>
            <v-btn to="/settings" color="secondary" class="mb-2">Settings</v-btn>
            <v-form ref="form">
              <v-row>
                <v-col cols="12"><v-text-field v-model="taskName" /></v-col>
                <v-col cols="10">
                  <v-text-field v-model="cron" />
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="prompt" label="Enter your prompt" outlined auto-grow dense />
                </v-col>
                <v-col cols="12">
                  <v-btn :color="error !== '' ? 'primary' : 'danger' " @click="saveSchedule">Save</v-btn>
                  <v-btn class="ml-6" @click="router.push('/settings')">Cancel</v-btn>
                  <v-alert v-if="error">{{ error }} </v-alert>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
