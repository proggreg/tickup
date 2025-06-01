<script setup lang="ts">
import Pusher from 'pusher-js'

const taskName = ref('')
const cron = ref('*/10 * * * * *')
const runtimeConfig = useRuntimeConfig()
const running = ref(false)
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
  channel.bind('prompt', function (data) {
    alert(JSON.stringify(data))
  })
})

const submitSchedule = async () => {
  if (!cron.value) {
    throw Error('schedule required')
  }

  try {
    const response = await $fetch('/api/ai/runTask', {
      method: 'POST',
      body: {
        cron: cron.value,
        prompt: prompt.value,
        start: true,
      },
    })
    running.value = true

    console.log('response', response)
  }
  catch (error) {
    console.error(error)
  }
}

const stop = async () => {
  const response = await $fetch('/api/ai/runTask', {
    method: 'POST',
    body: {
      stop: true,
    },
  })

  running.value = false
}

const saveSchedule = async () => {
  if (!cron.value) {
    throw Error('schedule required')
  }

  try {
    const response = await $fetch('/api/tasks/save', {
      method: 'POST',
      body: {
        name: taskName.value,
        cron: cron.value,
        prompt: prompt.value,
      },
    })
    console.log('Saved', response)

    if (response.error) {
      error.value = response.error
    }
  }
  catch (error) {
    error.value = error.message
    console.error('here', error.message)
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
                  <v-textarea
                    v-model="prompt"
                    label="Enter your prompt"
                    outlined
                    auto-grow
                    dense
                  />
                </v-col>
                <v-col cols="12">
                  <!-- <v-btn v-if="!running" color="success" @click="submitSchedule">Start</v-btn> -->
                    <v-btn  v-if="!running" color="primary" @click="saveSchedule">Save</v-btn>
                    <v-alert v-if="error">{{error}} </v-alert>
                  <!-- <v-btn v-else @click="stop" color="danger">Stop</v-btn> -->
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
