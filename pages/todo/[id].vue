<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()
definePageMeta({
  layout: 'todo',
})

onBeforeMount(() => {
  $fetch(`/api/todo/${params.id}`).then((todo) => {
    listStore.setCurrentTodo(todo as Todo)
    if (todo) {
      $fetch(`/api/list/${todo.listId}`).then((list) => {
        listStore.setCurrentList(list as List)
      })
    }
  })
})
</script>

<template>
  <NuxtErrorBoundary>
    <template #error="{ error }">
      <v-alert type="error">
        {{ error }}
      </v-alert>
    </template>
    <v-col class="fill-height">
      <TodoDetail />
    </v-col>
  </NuxtErrorBoundary>
</template>
