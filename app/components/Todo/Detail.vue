<script setup lang="ts">
const listsStore = useListsStore();
const { statuses } = useSettingsStore();
const router = useRouter();
const hasGithub = await useHasGithub();
const { mainWidth } = defineProps<{ mainWidth?: string }>();

function updateName() {
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo);
  }
}

const currentStatus = computed(
  () => statuses.find(s => s.name === listsStore.currentTodo.status) ?? statuses[0],
);

function setStatus(status: Status) {
  listsStore.currentTodo.status = status.name;
  listsStore.updateTodo(listsStore.currentTodo);
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const isOverdue = computed(() => {
  if (!listsStore.currentTodo.dueDate) return false;
  const d = new Date(listsStore.currentTodo.dueDate);
  d.setHours(0, 0, 0, 0);
  return d < today && listsStore.currentTodo.status !== 'Closed';
});

function updateDueDate(newDate: Date) {
  listsStore.currentTodo.dueDate = newDate;
  listsStore.updateTodo(listsStore.currentTodo);
}

async function deleteTodo() {
  if (!listsStore.currentTodo?.id) return;
  const listId = listsStore.currentTodo.listId;
  await listsStore.deleteTodo(listsStore.currentTodo.id);
  if (listId) {
    router.push(`/list/${listId}`);
  }
  else {
    router.push('/');
  }
}
</script>

<template>
  <v-row no-gutters>
    <v-col cols="12" :md="mainWidth ? mainWidth : 8" class="todo-main flex-grow-1">
      <!-- Title -->
      <v-col>
        <textarea v-model="listsStore.currentTodo.name" class="title-input" data-testid="todo-detail-title" rows="1"
          @blur="updateName" />
      </v-col>

      <!-- Description -->
      <v-col>
        <div class="section-label">
          Description
        </div>
        <textarea v-model="listsStore.currentTodo.desc" class="desc-textarea" placeholder="Add a description…"
          @input="listsStore.debounceUpdateTodo(listsStore.currentTodo)"
          @blur="listsStore.updateTodo(listsStore.currentTodo)" />
      </v-col>

      <v-divider />

      <v-col>
        <SubtaskItems />
      </v-col>

      <v-divider />

      <!-- Links -->
      <v-col>
        <TodoLinks />
      </v-col>
    </v-col>

    <v-col cols="auto" class="todo-sidebar flex-grow-1">
      <v-card width=" 100%" min-width="350" class="sidebar-card pa-4">
        <div class="prop-row">
          <div class="prop-row__label">
            <i class="mdi mdi-circle-slice-4 prop-row__icon" />
            <span>Status</span>
          </div>
          <div class="prop-row__value">
            <v-menu>
              <template #activator="{ props }">
                <button v-bind="props" class="status-pill" :style="{
                  background: `${currentStatus.color}18`,
                  color: currentStatus.color,
                  borderColor: `${currentStatus.color}33`,
                }">
                  <span class="status-pill__dot" :style="{ background: currentStatus.color }" />
                  {{ listsStore.currentTodo.status }}
                  <i class="mdi mdi-chevron-down status-pill__chevron" />
                </button>
              </template>
              <ul class="pop-menu">
                <li v-for="s in statuses" :key="s.name" class="pop-menu__item" @click="setStatus(s)">
                  <span class="pop-menu__dot" :style="{ background: s.color }" />
                  {{ s.name }}
                </li>
              </ul>
            </v-menu>
          </div>
        </div>

        <div class="prop-row">
          <div class="prop-row__label">
            <i class="mdi mdi-calendar prop-row__icon" />
            <span>Due date</span>
          </div>
          <div class="prop-row__value" :class="{ 'prop-row__value--overdue': isOverdue }">
            <AppDueDate :todo="listsStore.currentTodo" :todo-due-date="listsStore.currentTodo.dueDate"
              :show-detail="true" @set-date="updateDueDate" />
          </div>
        </div>
        <div class="prop-row">
          <div class="prop-row__label">
            <i class="mdi mdi-format-list-bulleted prop-row__icon" />
            <span>List</span>
          </div>
          <div class="prop-row__value prop-row__value--plain">
            {{ listsStore.currentList?.name }}
          </div>
        </div>

        <div v-if="hasGithub" class="prop-row">
          <div class="prop-row__label">
            <i class="mdi mdi-github prop-row__icon" />
            <span>GitHub</span>
          </div>
          <div class="prop-row__value">
            <GithubButton :todo="listsStore.currentTodo" />
          </div>
        </div>

        <div class="sidebar-divider" />

        <div class="sidebar-delete">
          <v-dialog width="260px">
            <template #activator="{ props: activatorProps }">
              <v-btn v-bind="activatorProps" color="error" variant="text" prepend-icon="mdi-trash-can-outline"
                size="small" class="delete-btn" />
            </template>
            <template #default="{ isActive }">
              <v-card rounded="lg">
                <v-card-text>
                  Are you sure you want to delete this todo?
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="error" @click="deleteTodo">
                    Delete
                  </v-btn>
                  <v-btn @click="isActive.value = false">
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.todo-detail {
  width: 100%;
  padding-bottom: 40px;
}

/* Two-column grid: left fluid, right fixed 248px */
.todo-layout {
  display: grid;
  grid-template-columns: 1fr 248px;
  gap: 20px;
  align-items: start;
}

/* Stack vertically on mobile */
@media (max-width: 959px) {
  .todo-layout {
    grid-template-columns: 1fr;
  }

  .todo-sidebar {
    order: -1;
  }
}

/* LEFT column */
.todo-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
  padding-bottom: 8px;
}




/* Title input */
.title-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Manrope', sans-serif;
  font-size: 1.3125rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
  padding: 2px 0;
  resize: none;
  box-sizing: border-box;
  overflow: hidden;
}

.title-input:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Section label */
.section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.45);
  margin-bottom: 8px;
}

/* Description textarea */
.desc-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
  font-family: inherit;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.desc-textarea::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.35);
}

/* Subtasks header */
.subtasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.subtasks-header__left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.subtasks-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  background: rgb(var(--v-theme-primary-container));
  color: rgb(var(--v-theme-on-primary-container));
  padding: 1px 7px;
  border-radius: 8px;
  transition:
    background 0.2s,
    color 0.2s;
}

.subtasks-badge--done {
  background: rgba(26, 122, 74, 0.12);
  color: #1a7a4a;
}

.subtasks-progress {
  width: 64px;
  height: 3px;
  border-radius: 2px;
  background: rgba(var(--v-border-color), 0.2);
  overflow: hidden;
}

.subtasks-progress__bar {
  height: 100%;
  border-radius: 2px;
  background: rgb(var(--v-theme-primary));
  transition:
    width 0.3s ease,
    background 0.3s;
}

.subtasks-progress__bar--done {
  background: #1a7a4a;
}

/* RIGHT sidebar */
.todo-sidebar {
  position: sticky;
  top: 16px;
}

.sidebar-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Property rows */
.prop-row {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.prop-row__label {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 80px;
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.5);
  user-select: none;
}

.prop-row__icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
  opacity: 0.6;
}

.prop-row__value {
  flex: 1;
  font-size: 0.875rem;
  min-width: 0;
}

.prop-row__value--plain {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
}

.prop-row__value--overdue :deep(*) {
  color: #ba1b24 !important;
  font-weight: 500;
}

/* Status pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 7px;
  border-radius: 20px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: inherit;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.status-pill:hover {
  opacity: 0.8;
}

.status-pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pill__chevron {
  font-size: 12px;
  opacity: 0.7;
}

.pop-menu {
  list-style: none;
  margin: 0;
  padding: 4px;
  min-width: 140px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.pop-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.1s;
}

.pop-menu__item:hover {
  background: rgba(var(--v-border-color), 0.08);
}

.pop-menu__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Sidebar divider and delete */
.sidebar-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.14);
  margin: 8px 0;
}

.sidebar-delete {
  display: flex;
  justify-content: flex-start;
}

.delete-btn {
  padding-left: 0 !important;
  font-size: 0.8125rem;
}
</style>
