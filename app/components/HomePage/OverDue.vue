<script setup lang="ts">
const listsStore = useListsStore();

const overdueTodos = computed(() => {
    return listsStore.overdueTodos || [];
});
</script>

<template>
    <HomePageTodoList
        :todos="overdueTodos"
        :group-by-status="true"
        :show-due-dates="true"
    />
</template>
