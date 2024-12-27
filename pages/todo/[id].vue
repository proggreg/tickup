<script setup lang="ts">
const { params } = useRoute()
const listStore = useListsStore()

onBeforeMount(() => {
  $fetch(`/api/todo/${params.id}`).then((todo) => {
    listStore.setCurrentTodo(todo as Todo)
    if (todo && listStore.currentTodo.listId !== listStore.currentList._id) {
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
    <!-- <v-col cols="12">
      <v-btn :to="`/list/${listStore.currentTodo.listId}`" :text="listStore.currentList.name" prepend-icon="mdi-arrow-left" />
    </v-col> -->

    <v-col class="fill-height">
      <TodoDetail />
    </v-col>
  </NuxtErrorBoundary>
</template>
