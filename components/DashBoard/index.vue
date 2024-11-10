<script setup lang="ts">
const { params } = useRoute()

const { data: todos } = await useFetch<Todo[]>('/api/list/todos', { query: { id: params.id } })

console.log('dashboard todos', todos)
</script>

<template>
  <Board
    v-if="todos"
    :todos="todos"
  />
</template>
