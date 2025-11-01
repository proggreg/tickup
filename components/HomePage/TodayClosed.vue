<script setup lang="ts">
const listsStore = useListsStore()

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status === 'Closed')
})
</script>

<template>
  <HomePageTodoList :todos="todaysClosedTodos" />
</template>
