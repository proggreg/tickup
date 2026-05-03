<script setup lang="ts">
const { params } = useRoute();
const { data: todos } = await useFetch<Task[]>('/api/list/todos', { query: { id: params.id } });
</script>

<template>
    <Board
        v-if="todos"
        :todos="todos"
    />
</template>
