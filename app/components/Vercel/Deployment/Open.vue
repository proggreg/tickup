<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <v-btn
        v-if="listStore.currentTodo.vercelDeploymentUrl"
        size="small"
        icon="mdi-open-in-new"
        :href="listStore.currentTodo.vercelDeploymentUrl"
        target="_blank"
    />
</template>
