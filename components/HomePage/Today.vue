<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()
const todaysTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status !== 'Closed')
})
function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo)
  navigateTo(`/todo/${todo._id}`)
}
function setClosed(todo: Todo) {
  todo.status = 'Closed'
  listsStore.updateTodo(todo)
}
</script>

<template>
  <v-card
    v-if="todaysTodos && todaysTodos.length"
    variant="flat"
  >
    <v-list>
      <v-list-item
        v-for="todo in todaysTodos"
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
