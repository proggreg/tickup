<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <v-btn
        v-if="listStore.currentTodo.githubLink"
        size="small"
        icon="mdi-open-in-new"
        :href="listStore.currentTodo.githubLink"
        target="_blank"
    />
</template>
