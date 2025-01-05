<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()

function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}
function setClosed(todo: Todo) {
  todo.status = 'Closed'
  listsStore.updateTodo(todo)
}
function formatDate(date: Date) {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('en-GB')
}
</script>

<template>
  <v-card
    v-if="listsStore.overdueTodos && listsStore.overdueTodos.length"
    variant="flat"
  >
    <v-list>
      <v-list-item
        v-for="todo in listsStore.overdueTodos"
        :key="todo._id"
        class="align-center"
        @click="selectTodo(todo)"
      >
        <template #prepend>
          <v-checkbox @click.stop="setClosed(todo)" />
        </template>
        <v-list-item-title class="text-h6">
          {{ todo.name }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ formatDate(todo.dueDate) }}
        </v-list-item-subtitle>

        <template #append>
          <AppDeleteButton :todo="todo" />
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <v-card
    v-else
    variant="flat"
    :class="['d-flex flex-column justify-center align-center', !isMobile ? 'fill-height' : '']"
  >
    <AppEmptyState height="100%" />
  </v-card>
</template>
