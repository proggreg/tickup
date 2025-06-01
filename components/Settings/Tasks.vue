<script setup lang="ts">
import Pusher from 'pusher-js'
import type { ObjectId } from 'mongoose'
const running = ref(false)
const error = ref('')
const runtimeConfig = useRuntimeConfig()


const { data: tasks, refresh } = await useFetch('/api/tasks', {
    transform: (data) => {
        return (data.tasks as Task[]).map((task) => {
            return {
                _id: task._id,
                name: task.name,
                cron: task.cron,
                prompt: task.prompt,
            }
        })
    },
})

async function deleteTask(id: ObjectId) {
    await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    refresh()
}

const runTask = async (task: Task) => {
  try {
    const response = await $fetch('/api/ai/runTask', {
      method: 'POST',
      body: {
        task: task,
        start: true,
      },
    })

    if ('error' in response) {
      error.value = response.error
      return
    }
    
    running.value = true

    console.log('response', response)
  }
  catch (err) {
    error.value = 'Failed to run task.'
    console.error(err)
  }
}

const stopTask = async (task: Task) => {
  try {
    const response = await $fetch('/api/ai/runTask', {
      method: 'POST',
      body: {
        task: task,
        stop: true,
      },
    })

    if ('error' in response) {
      error.value = response.error
      return
    }

    running.value = false

    console.log('response', response)
  }
  catch (err) {
    error.value = 'Failed to stop task.'
    console.error(err)
  }
}

onMounted(() => {
    if (!tasks.value) {
        refresh()
    }
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

    const eventSource = new EventSource('http://localhost:3000/event')

    eventSource.onmessage = (event) => {
    console.log(event.data)
    }
})
</script>

<template>
    <v-container class="py-6" max-width="600">
        <v-card elevation="2">
            <v-toolbar color="transparent">
                <v-toolbar-title class="text-h5" text="Scheduled Tasks" />

                <template #append>
                    <v-btn variant="plain" to="/schedule" class="ma-0 pa-0" type="icon" icon="mdi-plus-circle" />
                </template>
            </v-toolbar>
            <v-card-text>
                <v-list nav>
                    <v-list-item :to="`/tasks/${task._id}`" v-for="task in tasks" :key="task._id.toString()"
                        variant="plain">
                        <div class="d-flex align-center">
                            <div>
                                <v-btn variant="plain" size="x-small" icon="mdi-play" :color="error === '' ? 'primary' : 'red'"
                                    @click.prevent="runTask(task)" />
                                <v-btn variant="plain" size="x-small" icon="mdi-stop" :color="error === '' ? 'primary' : 'red'" 
                                    @click.prevent="stopTask(task)" />
                            </div>
                            <v-list-item-title>
                                {{ task.name }}
                            </v-list-item-title>

                            <v-alert v-if="error !== ''" type="error" class="ml-2">
                                {{ error }}
                            </v-alert>

                            <div class="ml-auto">
                                
                                <v-btn variant="plain" size="x-small" icon="mdi-pencil" color="primary"
                                    :to="`/tasks/${task._id}`" />
                                <v-btn variant="plain" class="ml-2" size="x-small" icon="mdi-delete" color="error"
                                    @click.stop="deleteTask(task._id)" />
                            </div>
                        </div>

                        
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-container>
</template>
