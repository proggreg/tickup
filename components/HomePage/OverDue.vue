<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()
const showClosed = ref(true)

function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}
function setClosed(todo: Todo) {
  todo.status = 'Closed'
  listsStore.updateTodo(todo)
}
function setOpen(todo: Todo) {
  todo.status = 'Open'
  listsStore.updateTodo(todo)
}
function formatDate(date: Date) {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('en-GB')
}

const openTodos = computed(() => {
  return listsStore.overdueTodos?.filter((todo: Todo) => todo.status !== 'Closed')
})

const closedTodos = computed(() => {
  return listsStore.overdueTodos?.filter((todo: Todo) => todo.status === 'Closed')
})
</script>

<template>
  <v-card
    v-if="listsStore.overdueTodos && listsStore.overdueTodos.length"
  >
    <v-list variant="plain">
      <v-list-subheader>Open</v-list-subheader>
      <v-list-item
        v-for="todo in openTodos"
        :key="todo._id"
        slim
        @click="selectTodo(todo)"
      >
        <template #prepend>
          <v-checkbox @click.stop="setClosed(todo)" />
        </template>
        <v-list-item-title class="text-h6">
          {{ todo.name }}
        </v-list-item-title>

        <v-list-item-subtitle v-if="todo.dueDate">
          {{ formatDate(todo.dueDate) }}
        </v-list-item-subtitle>

        <template #append>
          <AppDeleteButton :todo="todo" />
        </template>
      </v-list-item>
    </v-list>
    <v-list variant="plain">
      <v-list-subheader @click="showClosed = !showClosed">Closed</v-list-subheader>

      <v-list-item
        v-for="todo in closedTodos"

        :key="todo._id"
        slim
        @click="selectTodo(todo)"
      >
        <template #prepend>
          <v-checkbox :model-value="true" @click.stop="setOpen(todo)" />
        </template>
        <v-list-item-title class="text-h6">
          {{ todo.name }}
        </v-list-item-title>

        <v-list-item-subtitle v-if="todo.dueDate">
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
