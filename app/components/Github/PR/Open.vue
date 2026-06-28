<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <v-btn
        v-if="listStore.currentTodo.githubPrLink"
        size="small"
        icon="mdi-source-pull"
        :href="listStore.currentTodo.githubPrLink"
        target="_blank"
    />
</template>
