<script setup lang="ts">
type Deployment = {
    id: string;
    url: string;
    state: string;
    readyState: string;
    createdAt: number;
    target: string | null;
    branch: string | null;
    commitMessage: string | null;
};

const { notify } = useNotification();
const listStore = useListsStore();
const selectedProject = useState<{ id: string; name: string } | null>('vercelProject', () => null);
const loading = ref(false);
const loadingDeployments = ref(false);
const deployments = ref<Deployment[]>([]);
const selectedDeployment = ref<Deployment | null>(null);

watch(
    selectedProject,
    async (project) => {
        deployments.value = [];
        selectedDeployment.value = null;
        if (!project) return;
        loadingDeployments.value = true;
        try {
            const data = await $fetch<{ deployments: Deployment[] }>('/api/vercel/deployments', {
                query: { projectId: project.id },
            });
            deployments.value = data.deployments;
        } catch {
            notify('Failed to load Vercel deployments');
        } finally {
            loadingDeployments.value = false;
        }
    },
    { immediate: true },
);

async function linkDeployment() {
    if (!selectedProject.value || !selectedDeployment.value) return;
    loading.value = true;
    try {
        listStore.currentTodo.vercelProjectId = selectedProject.value.id;
        listStore.currentTodo.vercelDeploymentUrl = selectedDeployment.value.url;
        listStore.currentTodo.vercelDeploymentStatus =
            selectedDeployment.value.readyState || selectedDeployment.value.state;
        await listStore.updateTodo();
        notify('Vercel deployment linked');
    } catch {
        notify('Failed to link Vercel deployment');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div v-if="selectedProject" class="d-flex ga-1 align-center mt-2">
        <v-select
            v-model="selectedDeployment"
            :items="deployments"
            :loading="loadingDeployments"
            item-value="id"
            return-object
            label="Deployment"
            placeholder="Select a deployment"
            variant="outlined"
            density="compact"
            hide-details
            no-data-text="No deployments found"
        >
            <template #item="{ props, item }">
                <v-list-item
                    v-bind="props"
                    :title="item.raw.branch || item.raw.id"
                    :subtitle="`${item.raw.target || 'preview'} · ${new Date(item.raw.createdAt).toLocaleString()}`"
                />
            </template>
            <template #selection="{ item }">
                {{ item.raw.branch || item.raw.id }}
            </template>
        </v-select>
        <v-btn
            v-if="selectedDeployment"
            :loading="loading"
            icon="mdi-link"
            variant="tonal"
            size="x-small"
            color="green"
            @click="linkDeployment"
        />
    </div>
</template>
