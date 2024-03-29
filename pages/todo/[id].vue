<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
definePageMeta({
  layout: 'todo',
})
const todo = ref({})

onMounted(() => {
  $fetch(`/api/todo/${params.id}`).then((data) => {
    todo.value = data
    listStore.setCurrentTodo(data)
    console.log('todo', todo.value)
  })
})




</script>
<template>
    <TodoDetail />
</template>