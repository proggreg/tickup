<script setup lang="ts">
const listsStore = useListsStore();
const settingsStore = useSettingsStore();
const { mobile } = useDisplay();

function selectTodo(todo: Todo) {
  listsStore.setCurrentTodo(todo);
  if (mobile.value) {
    navigateTo(`/todo/${todo.id}`);
  } else {
    listsStore.panelOpen = true;
  }
}

function toggleTodo(todo: Todo) {
  todo.status = todo.status === 'Closed' ? 'Open' : 'Closed';
  listsStore.updateTodo(todo);
}

function statusColor(status: string): string {
  return settingsStore.statuses.find((s: Status) => s.name === status)?.color ?? '#005ac2';
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function relativeDue(
  dueDate: string | null | undefined,
  done: boolean,
): { text: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const overdue = diff < 0 && !done;
  let text: string;
  if (diff < 0) text = diff === -1 ? 'Yesterday' : `${-diff}d ago`;
  else if (diff === 0) text = 'Today';
  else if (diff === 1) text = 'Tomorrow';
  else text = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return { text, overdue };
}

const openTodos = computed(
  () => listsStore.currentList.todos?.filter((t: Todo) => t.status !== 'Closed') ?? [],
);

const closedTodos = computed(
  () => listsStore.currentList.todos?.filter((t: Todo) => t.status === 'Closed') ?? [],
);
</script>

<template>
  <div>
    <!-- Open todos -->
    <div class="todo-card mb-5" :class="{ 'pa-2': openTodos.length }">
      <div v-if="openTodos.length === 0" class="text-center pa-8 text-medium-emphasis text-body-2">
        No open tasks. You're all caught up.
      </div>
      <div v-for="todo in openTodos" :key="todo.id" class="todo-row d-flex align-center ga-3 px-4 py-3 rounded-lg"
        :class="{
          'todo-row--selected':
            listsStore.currentTodo?.id === todo.id && listsStore.panelOpen,
        }" @click="selectTodo(todo)">
        <button class="todo-check d-flex align-center justify-center flex-shrink-0"
          :style="{ border: `2px solid ${statusColor(todo.status)}` }" @click.stop="toggleTodo(todo)" />
        <span class="flex-grow-1 text-truncate text-body-2 font-weight-medium todo-name">
          {{ todo.name }}
        </span>
        <v-icon v-if="todo.priorityLev === 'high'" size="14" color="error">
          mdi-flag
        </v-icon>
        <span v-if="relativeDue(todo.dueDate, false)"
          class="d-inline-flex align-center ga-1 text-caption font-weight-medium flex-shrink-0" :class="relativeDue(todo.dueDate, false)?.overdue ? 'text-error' : 'text-disabled'
            ">
          <v-icon size="13">
            {{
              relativeDue(todo.dueDate, false)?.overdue
                ? 'mdi-calendar-alert'
                : 'mdi-calendar-blank-outline'
            }}
          </v-icon>
          {{ relativeDue(todo.dueDate, false)?.text }}
        </span>
        <v-icon class="todo-chevron flex-shrink-0" size="18" color="medium-emphasis">
          mdi-chevron-right
        </v-icon>
      </div>
    </div>

    <!-- Completed todos -->
    <template v-if="closedTodos.length">
      <div class="text-caption font-weight-bold text-uppercase text-disabled mb-2 px-2" style="letter-spacing: 0.07em">
        Completed · {{ closedTodos.length }}
      </div>
      <div class="todo-card pa-2">
        <div v-for="todo in closedTodos" :key="todo.id"
          class="todo-row todo-row--closed d-flex align-center ga-3 px-4 py-3 rounded-lg" @click="selectTodo(todo)">
          <button class="todo-check todo-check--done d-flex align-center justify-center flex-shrink-0"
            :style="{ background: statusColor(todo.status) }" @click.stop="toggleTodo(todo)">
            <v-icon size="11" color="white">mdi-check</v-icon>
          </button>
          <span class="flex-grow-1 text-truncate text-body-2 font-weight-medium todo-name todo-name--done">
            {{ todo.name }}
          </span>
          <span v-if="relativeDue(todo.dueDate, true)"
            class="d-inline-flex align-center ga-1 text-caption font-weight-medium text-disabled flex-shrink-0">
            <v-icon size="13">mdi-calendar-blank-outline</v-icon>
            {{ relativeDue(todo.dueDate, true)?.text }}
          </span>
          <v-icon class="todo-chevron flex-shrink-0" size="18" color="medium-emphasis">
            mdi-chevron-right
          </v-icon>
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

.todo-row {
  cursor: pointer;
  transition: background 0.1s;
}

.todo-row:hover {
  background: rgba(80, 96, 118, 0.06);
}

.todo-row:hover .todo-chevron {
  opacity: 1;
}

.todo-row--selected {
  background: rgb(var(--v-theme-primary-container));
}

.todo-row--closed {
  opacity: 0.65;
}

.todo-check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.12s,
    border-color 0.12s;
}

.todo-check--done {
  border: none !important;
}

.todo-name {
  font-size: 0.9375rem;
}

.todo-name--done {
  text-decoration: line-through;
  color: rgba(42, 52, 57, 0.6);
}

.todo-chevron {
  opacity: 0;
  transition: opacity 0.1s;
}
</style>
