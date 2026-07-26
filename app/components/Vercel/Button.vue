<script setup lang="ts">
const { todo } = defineProps<{ todo: Task }>();
const listStore = useListsStore();

const activatorColor = computed(() => {
    const state = listStore.currentTodo.vercelDeploymentStatus?.toLowerCase();
    if (state === 'ready') return 'green';
    if (state === 'error' || state === 'canceled') return 'red';
    if (state === 'building' || state === 'queued' || state === 'initializing') return 'orange';
    return undefined;
});
</script>

<template>
    <v-menu :close-on-content-click="false" elevation="0">
        <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-triangle" :color="activatorColor" />
        </template>
        <v-list density="compact" elevation="1" class="rounded-xl pa-2">
            <v-list-item slim>
                <VercelDeploymentSelect />
            </v-list-item>
        </v-list>
    </v-menu>
</template>
