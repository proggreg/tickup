<script setup lang="ts">
const { params } = useRoute()
const listsStore = useListsStore()

onBeforeMount(() => {
  $fetch(`/api/todo/${params.id}`).then((todo) => {
    listsStore.setCurrentTodo(todo as Todo)
    if (todo) {
      $fetch(`/api/list/${todo.listId}`).then((list) => {
        listsStore.setCurrentList(list as List)
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
    <v-col cols="12">
      <v-btn :to="listsStore.currentTodo.listId ? `/list/${listsStore.currentTodo.listId}`: `/`">
        <template #prepend>
          <v-icon>mdi-arrow-left</v-icon>
        </template>
        {{ listsStore.currentList.name }}
      </v-btn>
    </v-col>
    <v-col class=" pa-0">
      <TodoDetail />
    </v-col>
  </NuxtErrorBoundary>
</template>
