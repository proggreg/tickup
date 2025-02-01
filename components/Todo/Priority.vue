<script setup lang="ts">
const listStore = useListsStore()

enum Priorities {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}
const priorities = ref<Priorities[]>([Priorities.LOW, Priorities.NORMAL, Priorities.HIGH])
// function selectPriority(statusName: string) {
//   if (!statusName) return
// }

function updatePriority(priority: Priorities | null) {
  console.log('updatePriority', priority)
  if (!priority) return
  listStore.currentTodo.priority = priority
  listStore.updateTodo(listStore.currentTodo)
}
</script>

<template>
  <v-select
    class="pa-0 my-0"
    hide-details
    :items="priorities"
    max-width="300" density="compact" hide-selected
    item-title="name" variant="plain"
    @update:model-value="(priority: Priorities | null) => updatePriority(priority)"
  >
    <template #item="{ props, item }">
      <v-list-item v-bind="props" :title="item.title" />
    </template>
  </v-select>
</template>

<style scoped>
:deep(.v-field__input) {
  padding: 0;
}
</style>
