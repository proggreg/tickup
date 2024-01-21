<script setup lang="ts">
const listProps = defineProps<{ todos: Todo[], listName: string }>()
const { statuses } = useSettingsStore()
const open = reactive(['Open', 'In Progress', 'Closed'])
const dialog = ref(false)
const emit = defineEmits(['refresh'])
// TODO list count
function updateTodos() {
  emit('refresh')
}
</script>

<template>
  <v-list :opened="open">
    <v-list-subheader>{{ listProps.listName }}</v-list-subheader>

    <v-list-group v-for="status in statuses" :key="status.name" :value="status.name" fluid>


      <template #activator="{ props }">
        <v-list-item v-bind="props"
          :title="`${status.name} (${listProps.todos ? listProps.todos.filter((todo) => todo.status === status.name).length : 0})`" />
      </template>
      <ListItem :todos="listProps.todos" :status="status.name" @todo-clicked="dialog = true"
        @update-todos="updateTodos" />
      <AppDialog :open="dialog" @close="dialog = false">
        <TodoDetail />
      </AppDialog>
    </v-list-group>
  </v-list>
</template>
