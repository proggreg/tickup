<script setup lang="ts">
const { notify } = useNotification();
const listStore = useListsStore();
const loading = ref(false);

async function refreshDeployment() {
    if (!listStore.currentTodo.vercelProjectId) return;
    loading.value = true;
    try {
        const deployment = await $fetch<{ url: string; state: string; readyState: string }>(
            '/api/vercel/deployment',
            {
                query: { projectId: listStore.currentTodo.vercelProjectId },
            },
        );
        listStore.currentTodo.vercelDeploymentUrl = deployment.url;
        listStore.currentTodo.vercelDeploymentStatus = deployment.readyState || deployment.state;
        await listStore.updateTodo();
        notify('Deployment status refreshed');
    } catch {
        notify('Failed to refresh deployment status');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <v-btn :loading="loading" icon="mdi-refresh" size="small" @click="refreshDeployment" />
</template>
