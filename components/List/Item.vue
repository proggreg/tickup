<script lang="ts" setup>
const listsStore = useListsStore()
const { statuses } = useSettingsStore()
const { smAndDown } = useDisplay()
const itemProps = defineProps<{
  todos: Todo[],
  status: string
}>()

const emit = defineEmits(['TodoClicked', 'updateTodos'])

function selectTodo (todo: Todo) {
  listsStore.setCurrentTodo(todo)
}

function editTodo (todo: Todo, status: Status) {
  todo.status = status.name
  $fetch(`/api/list/todo/${todo._id}`, {
    method: 'PUT',
    body: todo
  })
}

function deleteTodo (todo: Todo) {
  if (todo._id) {
    listsStore.deleteTodo(todo._id)
    emit('updateTodos')
  }
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
              <template #activator="{props}">
                <ListStatus v-bind="props" :todo="todo" />
              </template>
              <v-list>
                <v-list-item v-for="status in statuses" :key="status.name" @click="editTodo(todo, status)">
                  {{ status.name }}
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </template>

        <v-list-item-title @click="selectTodo(todo)">
          {{ todo.name }}
        </v-list-item-title>

        <template #append>
          <AppDueDate :todo="todo" :todo-due-date="todo.dueDate" :show-detail="!smAndDown" />

          <v-list-item-action end>
            <v-btn
              variant="text"
              size="x-small"
              rounded="lg"
              icon="mdi-delete"
              @click.stop="deleteTodo(todo)"
            />
          </v-list-item-action>
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
