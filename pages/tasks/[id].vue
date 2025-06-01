<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id

const { data: task, refresh } = await useFetch(`/api/tasks/${id}`)

const name = ref(task.value?.name || '')
const desc = ref(task.value?.description || '')
const loading = ref(false)
const error = ref('')
const success = ref(false)

console.log('task', task)

async function updateTask() {
  loading.value = true
  error.value = ''
  try {
    await $fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: { name: name.value, description: desc.value },
    })
    success.value = true
    setTimeout(() => router.push('/settings'), 1000)
  }
  catch (e) {
    error.value = 'Failed to update task.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="py-6" max-width="600">
    <v-card elevation="2">
      <v-toolbar color="transparent">
        <v-toolbar-title class="text-h5">Edit Task</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form @submit.prevent="updateTask">
          <v-text-field v-model="name" label="Task Name" required />
          <v-textarea v-model="desc" label="Description" rows="3" />
          <v-btn :loading="loading" type="submit" color="primary" class="mt-4">Save</v-btn>
          <v-btn class="mt-4 ml-2" text @click="router.push('/settings')">Cancel</v-btn>
        </v-form>
        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" class="mt-4">Task updated!</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
