<script setup lang="ts">
const listsStore = useListsStore()
listsStore.getTodos()
useHead({ title: 'TickUp:Home' })

</script>

<template>
  <div>
    <TodoNew />
    <ListTable
      v-if="listsStore.todos"
      :todos="listsStore.todos"
      list-name="Today"
    />
  </div>
</template>
