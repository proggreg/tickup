<script setup lang="ts">
const listsStore = useListsStore();
const settingsStore = useSettingsStore();
const { mobile } = useDisplay();
const props = defineProps<{ task: Task }>()

function selectTodo(task: Task) {
  listsStore.setCurrentTodo(task);
  if (mobile.value) {
    navigateTo(`/task/${task.id}`);
  } else {
    listsStore.panelOpen = true;
  }
}

function toggleTodo(task: Task) {
  task.status = task.status === 'Closed' ? 'Open' : 'Closed';
  listsStore.updateTodo(task);
}

function statusColor(status: string): string {
  return settingsStore.statuses.find((s: Status) => s.name === status)?.color ?? '#005ac2';
}

function priorityColor(level: string | undefined): string | null {
  switch (level?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return null;
  }
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function relativeDue(
  dueDate: string,
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


</script>

<template>
  <div class="task-row d-flex align-center ga-3 px-4 py-3 rounded-lg" :class="{
    'task-row--selected':
      listsStore.currentTodo?.id === task.id && listsStore.panelOpen,
  }" @click="selectTodo(task)">
    <button class="task-check d-flex align-center justify-center flex-shrink-0"
      :style="{ border: `2px solid ${statusColor(task.status)}` }" @click.stop="toggleTodo(task)" />
    <span class="flex-grow-1 text-truncate text-body-2 font-weight-medium task-name" data-testid="task-title">
      {{ task.name }}
    </span>
    <div>
      <v-icon v-if="priorityColor(task.priorityLev)" data-testid="task-priority-icon" size="14"
        :color="priorityColor(task.priorityLev)" style="margin-top: -2px">
        mdi-flag
      </v-icon>
    </div>
    <span class="w-20 d-inline-flex align-center ga-1 text-caption font-weight-medium flex-shrink-0" :class="relativeDue(task.dueDate, false)?.overdue ? 'text-error' : 'text-disabled'
      ">
      <div style="width: 70px">
        <v-icon size="13">
          {{
            relativeDue(task.dueDate, false)?.overdue
              ? 'mdi-calendar-alert'
              : 'mdi-calendar-blank-outline'
          }}
        </v-icon>
        {{ relativeDue(task.dueDate, false)?.text }}
      </div>
    </span>
    <v-icon class="task-chevron flex-shrink-0" size="18" color="medium-emphasis">
      mdi-chevron-right
    </v-icon>
  </div>
</template>

<style scoped>
.task-row {
  cursor: pointer;
  transition: background 0.1s;
}

.task-row:hover {
  background: rgba(80, 96, 118, 0.06);
}

.task-row:hover .task-chevron {
  opacity: 1;
}

.task-row--selected {
  background: rgb(var(--v-theme-primary-container));
}

.task-row--closed {
  opacity: 0.65;
}

.task-check {
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

.task-check--done {
  border: none !important;
}

.task-name {
  font-size: 0.9375rem;
}

.task-name--done {
  text-decoration: line-through;
  color: rgba(42, 52, 57, 0.6);
}

.task-chevron {
  opacity: 0;
  transition: opacity 0.1s;
}
</style>
