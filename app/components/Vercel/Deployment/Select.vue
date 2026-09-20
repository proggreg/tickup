<script setup lang="ts">
const listStore = useListsStore();
const selectedProject = useState<{ id: string; name: string } | null>('vercelProject', () => null);
const projects = ref<{ id: string; name: string; framework: string | null }[]>([]);
const loading = ref(false);
const error = ref('');

const deploymentColor = computed(() => {
    const state = listStore.currentTodo.vercelDeploymentStatus?.toLowerCase();
    if (state === 'ready') return 'green';
    if (state === 'building' || state === 'queued' || state === 'initializing') return 'grey';
    if (state === 'error' || state === 'canceled') return 'red';
    return 'grey';
});

const deploymentVariant = computed(() => {
    return listStore.currentTodo.vercelDeploymentStatus?.toLowerCase() === 'ready'
        ? 'tonal'
        : 'outlined';
});

async function loadProjects() {
    loading.value = true;
    error.value = '';
    try {
        const data = await $fetch<{
            projects: { id: string; name: string; framework: string | null }[];
        }>('/api/vercel/projects');
        projects.value = data.projects;
        if (listStore.currentTodo.vercelProjectId) {
            selectedProject.value =
                projects.value.find((p) => p.id === listStore.currentTodo.vercelProjectId) ?? null;
        }
    } catch {
        error.value = 'Failed to load Vercel projects';
    } finally {
        loading.value = false;
    }
}

onMounted(loadProjects);

onUnmounted(() => {
    selectedProject.value = null;
});
</script>

<template>
    <v-chip
        v-if="listStore.currentTodo.vercelProjectId"
        :color="deploymentColor"
        :variant="deploymentVariant"
    >
        <v-icon icon="mdi-triangle" start />
        {{ selectedProject?.name ?? listStore.currentTodo.vercelProjectId }}
        <template #append>
            <VercelDeploymentOpen />
            <VercelDeploymentRefresh />
            <VercelDeploymentUnlink />
        </template>
    </v-chip>
    <v-autocomplete
        v-else
        v-model="selectedProject"
        :items="projects"
        :loading="loading"
        item-value="id"
        item-title="name"
        return-object
        label="Vercel Project"
        placeholder="Select a project"
        variant="outlined"
        density="compact"
        hide-details
        no-data-text="No projects found"
        :error-messages="error"
        prepend-inner-icon="mdi-triangle"
    >
        <template #item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw.framework ?? ''" />
        </template>
        <template #append>
            <VercelDeploymentLink />
        </template>
    </v-autocomplete>
</template>
