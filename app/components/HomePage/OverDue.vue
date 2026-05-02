<script setup lang="ts">
const listsStore = useListsStore();

onBeforeMount(() => {
    listsStore.getOverdueTodos();
});
</script>

<template>
    <HomePageTodoList
        :todos="listsStore.overdueTodos"
        :group-by-status="true"
        :show-due-dates="true"
    />
</template>
