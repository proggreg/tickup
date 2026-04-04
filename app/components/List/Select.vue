<script setup lang="ts">
const listsStore = useListsStore();
</script>

<template>
    <v-select
        v-model="listsStore.currentList.id"
        :items="listsStore.lists"
        item-title="name"
        item-value="id"
        min-width="75"
        data-testid="list-select"
    />
</template>
