<script setup lang="ts">
const listStore = useListsStore();
const selectedProject = useState('vercelProject', () => null);

async function unlinkProject() {
    selectedProject.value = null;
    listStore.currentTodo.vercelProjectId = undefined;
    listStore.currentTodo.vercelDeploymentUrl = undefined;
    listStore.currentTodo.vercelDeploymentStatus = undefined;
    await listStore.updateTodo();
}
</script>

<template>
    <v-btn color="red" icon="mdi-link-off" size="small" @click="unlinkProject" />
</template>
