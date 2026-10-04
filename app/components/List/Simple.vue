<script setup lang="ts">
const listsStore = useListsStore();
const today = new Date();
today.setHours(0, 0, 0, 0);

const openTasks = computed(
  () => listsStore.currentList.todos?.filter((t: Task) => t.status !== 'Closed') ?? [],
);

const closedTasks = computed(
  () => listsStore.currentList.todos?.filter((t: Task) => t.status === 'Closed') ?? [],
);
</script>

<template>
  <div>
    <!-- Open todos -->
    <div class="todo-card mb-5" :class="{ 'pa-2': openTasks.length }">
      <div v-if="openTasks.length === 0" class="text-center pa-8 text-medium-emphasis text-body-2">
        No open tasks. You're all caught up.
      </div>
      <div v-for="task in openTasks" :key="task.id">
        <ListRow :task="task" />
      </div>
    </div>

    <!-- Completed todos -->
    <template v-if="closedTasks.length">
      <div class="text-caption font-weight-bold text-uppercase text-disabled mb-2 px-2" style="letter-spacing: 0.07em">
        Completed · {{ closedTasks.length }}
      </div>
      <div class="todo-card pa-2">
        <div v-for="task in closedTasks" :key="task.id">
          <ListRow :task="task" />
        </div>
      </div>
    </template>

    <AppEmptyState v-if="!listsStore.currentList.todos?.length" />
  </div>
</template>

<style scoped>
.todo-card {
  background: white;
  border: 1px solid rgba(113, 124, 130, 0.18);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
}
</style>
