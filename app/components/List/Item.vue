<script lang="ts" setup>
  const listsStore = useListsStore()
  const { statuses } = useSettingsStore()
  const { smAndDown } = useDisplay()
  const itemProps = defineProps<{
    todos: Todo[]
    status: string
  }>()

  const emit = defineEmits(['TodoClicked', 'updateTodos'])

  function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo)
  }

  function editTodo(todo: Todo, status: Status) {
    todo.status = status.name
    $fetch(`/api/todo/${todo.id}`, {
      method: 'PUT',
      body: todo,
    })
  }
</script>

<template>
  <v-hover
    v-for="(todo, index) in itemProps.todos"
    :key="index"
  >
    <template #default="{ isHovering, props }">
      <v-list-item
        v-if="todo.status == itemProps.status"
        v-bind="props"
        rounded="lg"
        :variant="isHovering ? 'tonal' : 'text'"
        :class="isHovering ? 'mouseOver': ''"
        @click="emit('TodoClicked')"
      >
        <template #prepend>
          <v-list-item-action start>
            <v-menu>
              <template #activator="{ props: statusProps }">
                <ListStatus
                  v-bind="statusProps"
                  :todo="todo"
                />
              </template>
              <v-list>
                <v-list-item
                  v-for="statusItem in statuses"
                  :key="statusItem.name"
                  @click="editTodo(todo, statusItem)"
                >
                  {{ statusItem.name }}
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </template>

        <v-list-item-title @click="selectTodo(todo)">
          {{ todo.name }}
        </v-list-item-title>

        <template #append>
          <AppDueDate
            :todo="todo"
            :todo-due-date="todo.dueDate"
            :show-detail="!smAndDown"
          />

          <v-list-item-action end />
        </template>
      </v-list-item>
    </template>
  </v-hover>
</template>

<style scoped>
.add-todo-field {
  position: relative;
  z-index: 1;
}
.mouseOver {
  cursor: pointer;
}
</style>
