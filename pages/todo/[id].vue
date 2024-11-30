<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
definePageMeta({
  layout: 'todo',
})

onBeforeMount(() => {
  $fetch(`/api/todo/${params.id}`).then((todo) => {
    listStore.setCurrentTodo(todo)
    $fetch(`/api/list/${todo.listId}`).then((data) => {
      listStore.setCurrentList(data)
    })
  })
})
// onMounted(() => {
//   $fetch(`/api/todo/${params.id}`).then((todo) => {
//     listStore.setCurrentTodo(todo)
//     $fetch(`/api/list/${todo.listId}`).then((data) => {
//       listStore.setCurrentList(data)
//     })
//   })
// })

</script>
<template>
  <NuxtErrorBoundary>
    <template #error="{ error }">
      <v-alert litype="error">
        {{ error }}
      </v-alert>
    </template>
    <v-col>
      <TodoDetail />
    </v-col>
  </NuxtErrorBoundary>
</template>