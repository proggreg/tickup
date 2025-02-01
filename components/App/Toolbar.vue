<script setup lang="ts">
const on = useToolbar()
const store = useListsStore()

const toolbarOn = computed(() => {
  if (!store.currentList.todos || store.currentList.todos.length === 0) return false
  return store.currentList.todos.some(todo => todo.selected)
})

async function deselectAll() {
  store.currentList.todos.forEach(todo => todo.selected = false)
  on.value = false
}

function deleteSelected() {
  // TODO use delete many
  const deleteTodos = store.currentList.todos.filter(todo => todo.selected)
  for (const todo of deleteTodos) {
    if (!todo._id) continue
    store.deleteTodo(todo._id)
  }
  store.currentList.todos = store.currentList.todos.filter(todo => !todo.selected)

  on.value = false
}
</script>

<template>
  <v-snackbar v-model="toolbarOn" timeout="-1">
    <template #text>
      <v-btn @click="deselectAll">
        Deselect All
      </v-btn>
    </template>
    <template #actions>
      <v-btn @click="deleteSelected">
        Delete
      </v-btn>
    </template>
  </v-snackbar>
</template>
