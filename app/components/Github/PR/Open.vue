<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <v-btn
        v-if="listStore.currentTodo.githubPrLink"
        size="small"
        icon="mdi-source-pull"
        @click.stop="window.open(listStore.currentTodo.githubPrLink, '_blank')"
    />
</template>
