<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()
const opened = ref(['Open'])

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
    variant="flat"
  >
    <v-list :opened="opened" variant="plain">
      <v-list-group value="Open">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi mdi-border-all-variant"
            title="Open"
          />
        </template>

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
      </v-list-group>

      <v-list-group value="Closed">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi mdi-check-all"
            title="Closed"
          />
        </template>

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
      </v-list-group>
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
