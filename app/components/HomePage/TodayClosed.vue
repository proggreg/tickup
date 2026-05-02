<script setup lang="ts">
const listsStore = useListsStore();
const { isTodoClosed } = useTodoStatus();

const todaysClosedTodos = computed(() => {
    return listsStore.todaysTodos.filter(todo => isTodoClosed(todo.status));
});
</script>

<template>
    <HomePageTodoList :todos="todaysClosedTodos" />
</template>
