<script setup lang="ts">
const listsStore = useListsStore();
const router = useRouter();

const completedOpen = ref(false);
const quickAddText = ref('');

onBeforeMount(async () => {
    await listsStore.getCurrentList();
});

watch(
    () => listsStore.currentList,
    (list) => {
        if (!list?.id) {
            navigateTo('/');
        }
        else {
            useHead({ title: `TickUp: ${list.name}` });
        }
    },
    { immediate: true },
);

const openTodos = computed(() =>
    (listsStore.currentList?.todos ?? []).filter(
        (t: Todo) => t.status !== 'Closed',
    ),
);

const closedTodos = computed(() =>
    (listsStore.currentList?.todos ?? []).filter(
        (t: Todo) => t.status === 'Closed',
    ),
);

function formatDueDate(raw: Date | string | undefined): string | null {
    if (!raw) return null;
    const due = new Date(raw);
    if (isNaN(due.getTime())) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 0) return `In ${diff}d`;
    return `${Math.abs(diff)}d ago`;
}

function isOverdue(raw: Date | string | undefined): boolean {
    if (!raw) return false;
    const due = new Date(raw);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
}

async function toggleDone(todo: Todo) {
    todo.status = todo.status === 'Closed' ? 'Open' : 'Closed';
    await listsStore.updateTodo(todo);
}

async function quickAdd() {
    const name = quickAddText.value.trim();
    if (!name) return;
    listsStore.newTodo.name = name;
    listsStore.newTodo.listId = listsStore.currentList.id;
    await listsStore.addTodo();
    quickAddText.value = '';
}

function goToTodo(id: string | undefined) {
    if (id) router.push(`/todo/${id}`);
}

const listColor = computed(() => (listsStore.currentList as any)?.color || '#005ac2');
const listIcon = computed(() => listsStore.currentList?.icon || 'mdi-format-list-bulleted');
</script>

<template>
    <div class="list-page">
        <!-- Header -->
        <div class="list-header">
            <div
                class="list-icon-tile"
                :style="{ background: listColor }"
            >
                <v-icon color="white" size="24">
                    {{ listIcon }}
                </v-icon>
            </div>
            <span class="list-title">{{ listsStore.currentList?.name }}</span>
            <v-chip
                v-if="openTodos.length > 0"
                class="ml-3"
                size="small"
                color="primary"
                variant="tonal"
            >
                {{ openTodos.length }} open
            </v-chip>
        </div>

        <!-- Quick add input -->
        <div class="quick-add-wrap">
            <v-text-field
                v-model="quickAddText"
                placeholder="Add a task…"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-plus"
                class="quick-add-field"
                @keyup.enter="quickAdd"
            />
        </div>

        <!-- Open tasks card -->
        <div class="task-card">
            <div
                v-if="openTodos.length === 0"
                class="empty-state"
            >
                <v-icon color="grey-lighten-1" size="32">mdi-check-all</v-icon>
                <span class="ml-2 text-grey-lighten-1">All done!</span>
            </div>
            <div
                v-for="todo in openTodos"
                :key="todo.id"
                class="todo-row"
                @click.stop="goToTodo(todo.id)"
            >
                <v-checkbox-btn
                    :model-value="false"
                    color="primary"
                    class="todo-checkbox"
                    @click.stop="toggleDone(todo)"
                />
                <span class="todo-name">{{ todo.name }}</span>
                <v-icon
                    v-if="todo.priorityLev === 'high'"
                    color="error"
                    size="small"
                    class="ml-auto flex-shrink-0"
                >
                    mdi-flag
                </v-icon>
                <span
                    v-if="todo.dueDate"
                    class="due-label flex-shrink-0"
                    :class="{ overdue: isOverdue(todo.dueDate) }"
                    :style="{ marginLeft: todo.priorityLev === 'high' ? '6px' : 'auto' }"
                >
                    {{ formatDueDate(todo.dueDate) }}
                </span>
            </div>
        </div>

        <!-- Completed section toggle -->
        <div class="completed-header" @click="completedOpen = !completedOpen">
            <v-icon size="18" class="mr-1">
                {{ completedOpen ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
            </v-icon>
            <span class="completed-label">Completed · {{ closedTodos.length }}</span>
        </div>

        <!-- Completed tasks card -->
        <div v-show="completedOpen" class="task-card">
            <div
                v-for="todo in closedTodos"
                :key="todo.id"
                class="todo-row"
                @click.stop="goToTodo(todo.id)"
            >
                <v-checkbox-btn
                    :model-value="true"
                    color="primary"
                    class="todo-checkbox"
                    @click.stop="toggleDone(todo)"
                />
                <span class="todo-name todo-name--done">{{ todo.name }}</span>
                <v-icon
                    v-if="todo.priorityLev === 'high'"
                    color="error"
                    size="small"
                    class="ml-auto flex-shrink-0"
                >
                    mdi-flag
                </v-icon>
                <span
                    v-if="todo.dueDate"
                    class="due-label flex-shrink-0"
                    :class="{ overdue: isOverdue(todo.dueDate) }"
                    :style="{ marginLeft: todo.priorityLev === 'high' ? '6px' : 'auto' }"
                >
                    {{ formatDueDate(todo.dueDate) }}
                </span>
            </div>
            <div v-if="closedTodos.length === 0" class="empty-state">
                <span class="text-grey-lighten-1">No completed tasks yet.</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-page {
    background: #f7f9fb;
    min-height: 100vh;
    padding: 32px 24px;
    font-family: 'Inter', sans-serif;
}

/* Header */
.list-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
}

.list-icon-tile {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.list-title {
    font-family: 'Manrope', sans-serif;
    font-weight: 800;
    font-size: 1.75rem;
    color: #1a1a2e;
    line-height: 1.2;
}

/* Quick add */
.quick-add-wrap {
    margin-bottom: 16px;
}

.quick-add-field :deep(.v-field) {
    border-radius: 10px;
    background: #fff;
}

/* Task card */
.task-card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(42, 52, 57, 0.06);
    margin-bottom: 16px;
    overflow: hidden;
}

/* Todo rows */
.todo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid #f0f2f5;
}

.todo-row:last-child {
    border-bottom: none;
}

.todo-row:hover {
    background: #f7f9fb;
}

.todo-checkbox {
    flex-shrink: 0;
}

.todo-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9375rem;
    color: #1a1a2e;
}

.todo-name--done {
    text-decoration: line-through;
    color: #9aa3b0;
}

.due-label {
    font-size: 0.8125rem;
    color: #6b7280;
}

.due-label.overdue {
    color: #ba1b24;
    font-weight: 600;
}

/* Completed header */
.completed-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 10px;
    user-select: none;
}

.completed-label {
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    color: #4b5563;
    letter-spacing: 0.01em;
}

/* Empty state */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: #9aa3b0;
}
</style>
