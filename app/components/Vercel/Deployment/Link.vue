<script setup lang="ts">
const { notify } = useNotification();
const listStore = useListsStore();
const selectedProject = useState<{ id: string; name: string } | null>('vercelProject', () => null);
const loading = ref(false);

async function linkProject() {
    if (!selectedProject.value) return;
    loading.value = true;
    try {
        const deployment = await $fetch<{ url: string; state: string; readyState: string }>(
            '/api/vercel/deployment',
            { query: { projectId: selectedProject.value.id } },
        );
        listStore.currentTodo.vercelProjectId = selectedProject.value.id;
        listStore.currentTodo.vercelDeploymentUrl = deployment.url;
        listStore.currentTodo.vercelDeploymentStatus = deployment.readyState || deployment.state;
        await listStore.updateTodo();
        notify('Vercel project linked');
    } catch {
        notify('Failed to link Vercel project');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <v-btn
        v-if="selectedProject"
        :loading="loading"
        icon="mdi-link"
        variant="tonal"
        size="x-small"
        color="green"
        @click="linkProject"
    />
</template>
