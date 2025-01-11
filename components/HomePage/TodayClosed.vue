<script setup lang="ts">
const listsStore = useListsStore()
const { isMobile } = useDevice()

const todaysClosedTodos = computed(() => {
  return listsStore.todaysTodos.filter(todo => todo.status === 'Closed')
})

function setOpen(todo: Todo) {
  todo.status = 'Open'
  listsStore.updateTodo(todo)
}
</script>

<template>
  <v-card v-if="todaysClosedTodos.length" variant="flat">
    <v-list
      variant="plain"
      class="pa-4"
    >
      <v-list-item
        v-for="todo in todaysClosedTodos"
        :key="todo._id"
      >
        <template #prepend>
          <v-checkbox :model-value="true" @click.stop="setOpen(todo)" />
        </template>
        <v-list-item-title class="text-h6">
          {{ todo.name }}
        </v-list-item-title>

        <template #append>
          <v-btn
            icon
            elevation="0"
            @click="listsStore.deleteTodo(todo._id!)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
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
