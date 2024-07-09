<script setup lang="ts">
const { params } = useRoute()

const { data: todos } = await useFetch<Todo[]>('/api/list/todos', { query: { id: params.id } })
</script>

<template>
  <div class="">
    <Board
      v-if="todos"
      :todos="todos"
    />
  </div>
</template>
