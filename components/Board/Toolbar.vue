<script setup lang="ts">
const on = useToolbar()
const store = useListsStore()

function deleteSelected() {
  // TODO use delete many
  const deleteTodos = store.currentList.todos.filter(todo => todo.selected)
  for (const todo of deleteTodos) {
    store.deleteTodo(todo._id)
  }
  store.currentList.todos = store.currentList.todos.filter(todo => !todo.selected)

  on.value = false
}
</script>

<template>
  <v-snackbar
    v-model="on"
    timeout="-1"
  >
    <template #text>
      <v-btn @click="on = false">
        Dismiss
      </v-btn>
    </template>
    <template #actions>
      <v-btn @click="deleteSelected">
        Delete
      </v-btn>
    </template>
  </v-snackbar>
</template>
