<script setup lang="ts">
const { data: tasks, refresh } = await useFetch('/api/tasks', {
  transform: (data) => {
    return data.tasks.map((task) => {
      return {
        _id: task._id,
        name: task.name,
        desc: task.description,
      }
    })
  },
})

async function deleteTask(id) {
  await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <v-container class="py-6" max-width="600">
    <v-card elevation="2">
      <v-toolbar color="transparent">
        <v-toolbar-title class="text-h5" text="Scheduled Tasks" />

        <template #append>
          <v-btn to="/schedule" class="ma-0 pa-0" type="icon" icon="mdi-plus-circle" />
        </template>
      </v-toolbar>
      <v-card-text>
        <v-form class="mb-6">
          <v-row align="center" no-gutters>
            <v-col cols="9">
              <v-text v-model="newTask" label="Add a new task..." dense outlined hide-details />
            </v-col>
          </v-row>
        </v-form>
        <v-list>
          <v-list-item v-for="task in tasks" :key="task._id">
            <v-list-item-title :class="task.completed ? 'text-decoration-line-through text-grey' : ''">
              Name: {{ task.name }}
            </v-list-item-title>

            <v-btn size="x-small" icon="mdi-pencil" color="primary" :to="`/tasks/${task._id}`" />

            <v-btn size="x-small" icon="mdi-delete" color="error" @click="deleteTask(task._id)" />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>
