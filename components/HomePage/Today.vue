<script setup lang="ts">
const listsStore = useListsStore()

const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status !== 'Closed')
})
</script>

<template>
  <HomePageTodoList :todos="todaysTodos" />
</template>
