<script setup lang="ts">
import type { ObjectId } from 'mongoose'

const { data: tasks, refresh } = await useFetch('/api/tasks', {
    transform: (data) => {
        return (data.tasks as Task[]).map((task) => {
            return {
                _id: task._id,
                name: task.name,
            }
        })
    },
})

async function deleteTask(id: ObjectId) {
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
                    <v-btn variant="plain" to="/schedule" class="ma-0 pa-0" type="icon" icon="mdi-plus-circle" />
                </template>
            </v-toolbar>
            <v-card-text>
                <v-list nav>
                    <v-list-item :to="`/tasks/${task._id}`" v-for="task in tasks" :key="task._id.toString()"
                        variant="plain">
                        <div class="d-flex">
                            <v-list-item-title>
                                {{ task.name }}
                            </v-list-item-title>

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
