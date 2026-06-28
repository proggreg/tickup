<script setup lang="ts">
const listStore = useListsStore();
</script>

<template>
    <v-btn
        v-if="listStore.currentTodo.githubPrLink"
        size="small"
        icon="mdi-source-pull"
        @click.stop="navigateTo(listStore.currentTodo.githubPrLink, { open: { target: '_blank' } })"
    />
</template>
