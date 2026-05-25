<script setup lang="ts">
import { nextTick } from 'vue';

const listsStore = useListsStore();
const router = useRouter();

const newSubtaskName = ref('');
const expandedPanel = ref<string | undefined>(undefined);
const subtasksExpanded = computed(() => expandedPanel.value === 'subtasks');

const activeCount = computed(() => {
    if (!listsStore.currentTodo.subtasks) return 0;
    return listsStore.currentTodo.subtasks.filter(subtask => subtask.status !== 'Closed').length;
});

const subtasksFilter = ref<'all' | 'active'>('all');
const subtasksSortBy = ref<'none' | 'priority'>('none');

const subtaskNameRefs = ref<any[]>([]);
const editingSubtaskIds = ref<(string | number)[]>([]);

const isEditingSubtask = (id: string | number) => editingSubtaskIds.value.includes(id);

const getPriorityOrder = (priority: string | null | undefined): number => {
    if (!priority) return 4;
    const p = priority.toLowerCase();
    if (p === 'high') return 1;
    if (p === 'medium') return 2;
    if (p === 'low') return 3;
    return 4;
};

const filteredAndSortedSubtasks = computed(() => {
    if (!listsStore.currentTodo.subtasks) return [];

    let filtered = [...listsStore.currentTodo.subtasks];

    // Apply filter
    if (subtasksFilter.value === 'active') {
        filtered = filtered.filter((subtask) => subtask.status !== 'Closed');
    }

    // Apply sort
    if (subtasksSortBy.value === 'priority') {
        return filtered.sort((a, b) => {
            return getPriorityOrder(a.priorityLev) - getPriorityOrder(b.priorityLev);
        });
    }

    return filtered;
});

const baseLinkableTodos = computed(() => {
    const todos = listsStore.currentList?.todos || [];
    return todos.filter((todo) => {
        if (!todo.id || listsStore.currentTodo?.id === todo.id) return false;
        if ((todo as any).parentId) return false;
        if (listsStore.currentTodo?.subtasks?.some(st => st.id === todo.id)) return false;
        return true;
    });
});

const linkableTodos = computed(() => {
    let todos = [...baseLinkableTodos.value];

    const rawSearch = linkSearch.value ?? '';
    const q = String(rawSearch).trim().toLowerCase();
    if (q) {
        todos = todos.filter((todo) => todo.name?.toLowerCase().includes(q));
    }

    // Sort by most recently edited when possible (updatedAt),
    // falling back to dueDate, then id.
    todos.sort((a, b) => {
        const getTime = (t: any) => {
            if (t.updatedAt) return new Date(t.updatedAt).getTime();
            if (t.dueDate) return new Date(t.dueDate).getTime();
            if (t.id) {
                const n = Number(t.id);
                return Number.isNaN(n) ? 0 : n;
            }
            return 0;
        };
        return getTime(b) - getTime(a);
    });
    return todos;
});

async function addSubtask() {
    if (!newSubtaskName.value || !listsStore.currentTodo?.id) return;
    await listsStore.addSubtask(newSubtaskName.value, listsStore.currentTodo.id);
    newSubtaskName.value = '';
}

async function deleteSubtask(subtaskId: string | number) {
    await listsStore.deleteSubtask(subtaskId);
}

async function linkExistingTodo(todo: Todo) {
    if (!listsStore.currentTodo?.id || !todo.id) return;
    if ((todo as any).parentId) return;
    todo.parentId = listsStore.currentTodo.id;
    const updated = await listsStore.updateTodo(todo);
    if (!listsStore.currentTodo.subtasks) listsStore.currentTodo.subtasks = [];
    // Avoid duplicates
    if (!listsStore.currentTodo.subtasks.some((st) => st.id === updated.id)) {
        listsStore.currentTodo.subtasks.push(updated);
    }
}

function navigateToSubtask(subtaskId: string | number) {
    router.push(`/todo/${subtaskId}`);
}

function renameSubtask(subtaskId: string | number, index: number) {
    if (!editingSubtaskIds.value.includes(subtaskId)) {
        editingSubtaskIds.value.push(subtaskId);
    }
    const input = subtaskNameRefs.value[index];
    if (input && typeof input.focus === 'function') {
        nextTick(() => input.focus());
    }
}

function onSubtaskBlur(subtask: Todo) {
    editingSubtaskIds.value = editingSubtaskIds.value.filter(id => id !== subtask.id);
    listsStore.updateTodo(subtask);
}

async function updatePriority(subtask: Todo, level: string) {
    subtask.priorityLev = level;
    listsStore.updateTodo(subtask);
}

function toggleSort() {
    subtasksSortBy.value = subtasksSortBy.value === 'priority' ? 'none' : 'priority';
}

function toggleStatus(subtask: Todo) {
    subtask.status = subtask.status === 'Closed' ? 'Open' : 'Closed';
    listsStore.updateTodo(subtask);
}

function formatDueDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<template>
    <v-expansion-panels v-model="expandedPanel" rounded="lg" flat>
        <v-expansion-panel value="subtasks" elevation="0" class="pa-0" width="100%">
            <v-expansion-panel-title hide-actions class="pa-0" data-testid="subtasks-header">
                <div class="d-flex align-center justify-space-between w-100">
                    <div class="text-subtitle-1 font-weight-bold d-flex align-center">
                        <span class="mr-2">Subtasks</span>
                        <v-chip
                            v-if="
                                listsStore.currentTodo.subtasks &&
                                listsStore.currentTodo.subtasks.length
                            "
                            size="small"
                            variant="tonal"
                            color="primary"
                        >
                            {{ activeCount }}/{{ listsStore.currentTodo.subtasks.length }}
                        </v-chip>
                    </div>
                    <SubtaskFilters
                        v-if="
                            listsStore.currentTodo.subtasks &&
                            listsStore.currentTodo.subtasks.length
                        "
                        v-model:filter="subtasksFilter"
                        v-model:sort-by="subtasksSortBy"
                        :expanded="subtasksExpanded"
                        :has-subtasks="
                            !!(
                                listsStore.currentTodo.subtasks &&
                                listsStore.currentTodo.subtasks.length
                            )
                        "
                        @update:expanded="expandedPanel = $event ? 'subtasks' : undefined"
                    />
                </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="subtasks-panel-text pa-0">
                <div class="d-flex align-center">
                    <v-text-field
                        v-model="newSubtaskName"
                        label="Add subtask"
                        hide-details
                        variant="outlined"
                        class="my-4 flex-grow-1"
                        style="min-width: 120px"
                        data-testid="add-subtask-input"
                        @keyup.enter="addSubtask"
                    />
                    <v-btn
                        icon="mdi-plus"
                        size="small"
                        variant="tonal"
                        color="primary"
                        :disabled="!newSubtaskName"
                        data-testid="add-subtask-button"
                        class="mr-2"
                        @click="addSubtask"
                    />
                    <v-menu :width="400" location="bottom">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                icon="mdi-link-plus"
                                size="small"
                                variant="text"
                                color="primary"
                                data-testid="link-subtask-button"
                            />
                        </template>
                        <v-list density="compact">
                            <v-list-item>
                                <v-text-field
                                    v-model="linkSearch"
                                    placeholder="Search tasks"
                                    hide-details
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                    data-testid="link-subtask-search"
                                    @click.stop
                                />
                            </v-list-item>
                            <v-divider />
                            <v-list-item
                                v-for="todo in linkableTodos"
                                :key="todo.id"
                                :data-testid="`link-subtask-option-${todo.id}`"
                                @click="linkExistingTodo(todo)"
                            >
                                <v-list-item-title>
                                    {{ todo.name }}
                                </v-list-item-title>
                            </v-list-item>
                            <v-list-item v-if="!baseLinkableTodos.length">
                                <v-list-item-title> No tasks available to link </v-list-item-title>
                            </v-list-item>
                            <v-list-item
                                v-else-if="baseLinkableTodos.length && !linkableTodos.length"
                            >
                                <v-list-item-title> No tasks match your search </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <v-virtual-scroll
                    height="300"
                    :items="filteredAndSortedSubtasks"
                    data-testid="subtasks-list"
                >
                    <template #default="{ item: subtask, index }">
                        <v-list-item
                            :key="subtask.id"
                            class="py-0 px-0 align-center"
                            style="cursor: pointer"
                            :data-testid="`subtask-item-${index}`"
                            @click="navigateToSubtask(subtask.id)"
                        >
                            <template #prepend>
                                <div class="">
                                    <v-checkbox
                                        v-model="subtask.status"
                                        :true-value="'Closed'"
                                        :false-value="'Open'"
                                        density="compact"
                                        class="mr-1"
                                        :data-testid="`subtask-checkbox-${index}`"
                                        @click.stop
                                        @change="listsStore.updateTodo(subtask)"
                                    />
                                </div>
                            </template>
                            <div
                                v-if="subtask.status === 'Closed' || !isEditingSubtask(subtask.id)"
                                :data-testid="`subtask-name-${index}`"
                                class="subtask-name-readonly"
                                :class="{
                                    'text-decoration-line-through text-disabled':
                                        subtask.status === 'Closed',
                                }"
                                @click.stop="navigateToSubtask(subtask.id)"
                            >
                                {{ subtask.name }}
                            </div>
                            <v-text-field
                                v-else
                                :ref="(el) => (subtaskNameRefs[index] = el)"
                                v-model="subtask.name"
                                hide-details
                                variant="plain"
                                :class="{
                                    'text-decoration-line-through text-disabled':
                                        subtask.status === 'Closed',
                                }"
                                :data-testid="`subtask-name-input-${index}`"
                                @blur="onSubtaskBlur(subtask)"
                            />
                            <template #append>
                                <v-row class="d-flex align-center gap-4" min-width="500px">
                                    <v-col>
                                        <SubtaskPriority
                                            :subtask="subtask"
                                            :index="index"
                                            @update-priority="
                                                (level) => updatePriority(subtask, level)
                                            "
                                        />
                                    </v-col>
                                    <v-col>
                                        <v-menu>
                                            <template #activator="{ props }">
                                                <v-btn
                                                    v-bind="props"
                                                    icon="mdi-dots-vertical"
                                                    size="small"
                                                    variant="text"
                                                    density="compact"
                                                    :data-testid="`subtask-menu-${index}`"
                                                    @click.stop
                                                />
                                            </template>
                                            <v-list density="compact">
                                                <v-list-item
                                                    :data-testid="`subtask-rename-${index}`"
                                                    @click="renameSubtask(subtask.id, index)"
                                                >
                                                    <template #prepend>
                                                        <v-icon> mdi-pencil </v-icon>
                                                    </template>
                                                    <v-list-item-title>
                                                        Rename subtask
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item
                                                    :data-testid="`subtask-delete-${index}`"
                                                    @click="deleteSubtask(subtask.id)"
                                                >
                                                    <template #prepend>
                                                        <v-icon color="error"> mdi-delete </v-icon>
                                                    </template>
                                                    <v-list-item-title>
                                                        Delete subtask
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </template>
                            <v-list density="compact">
                                <v-list-item
                                    :data-testid="`subtask-done-delete-${index}`"
                                    @click="deleteSubtask(subtask.id)"
                                >
                                    <template #prepend>
                                        <v-icon color="error">mdi-delete</v-icon>
                                    </template>
                                    <v-list-item-title>Delete subtask</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </li>
            </ul>
        </template>
    </section>
</template>

<style scoped>
.subtasks {
    --st-fg: #2a3439;
    --st-fg-mid: rgba(42, 52, 57, 0.58);
    --st-fg-low: rgba(42, 52, 57, 0.38);
    --st-fg-faint: rgba(42, 52, 57, 0.22);
    --st-border: rgba(113, 124, 130, 0.16);
    --st-hover: rgba(113, 124, 130, 0.07);
    --st-paper: #f7f9fb;
    --st-primary: #005ac2;
    font-family: 'Inter', sans-serif;
    color: var(--st-fg);
}

/* Header */
.subtasks__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.subtasks__title-group {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.subtasks__title {
    font-family: 'Manrope', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--st-fg);
    margin: 0;
}

.subtasks__count {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--st-fg-mid);
    font-variant-numeric: tabular-nums;
}

.subtasks__header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.subtasks__ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--st-fg-mid);
    transition:
        background 0.12s,
        color 0.12s;
}

.subtasks__ghost-btn:hover {
    background: var(--st-hover);
    color: var(--st-fg);
}

.subtasks__icon-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--st-fg-mid);
    padding: 0;
    transition:
        background 0.12s,
        color 0.12s;
    flex-shrink: 0;
}

.subtasks__icon-btn:hover {
    background: var(--st-hover);
    color: var(--st-fg);
}

.subtasks__icon-btn--active {
    color: var(--st-primary);
    background: rgba(0, 90, 194, 0.1);
}

/* Add row */
.subtasks__add {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--st-paper);
    margin-bottom: 8px;
    transition: box-shadow 0.12s;
}

.subtasks__add:focus-within {
    box-shadow: 0 0 0 2px rgba(0, 90, 194, 0.18);
}

.subtasks__add-icon {
    color: var(--st-fg-low);
    flex-shrink: 0;
}

.subtasks__add-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--st-fg);
    min-width: 0;
}

.subtasks__add-input::placeholder {
    color: var(--st-fg-low);
}

.subtasks__kbd {
    font-family: inherit;
    font-size: 0.6875rem;
    color: var(--st-fg-low);
    padding: 2px 6px;
    border: 1px solid var(--st-border);
    border-radius: 4px;
    background: #fff;
}

/* Rows */
.subtasks__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.subtasks__row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    margin: 0 -8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;
}

.subtasks__row:hover {
    background: var(--st-hover);
}

.subtasks__row:hover .subtasks__row-actions {
    opacity: 1;
}

.subtasks__row:hover .subtasks__priority-wrap {
    opacity: 1;
}

.subtasks__row--done .subtasks__name {
    color: var(--st-fg-low);
    text-decoration: line-through;
}

.subtasks__row-body {
    flex: 1;
    min-width: 0;
}

.subtasks__name {
    font-size: 0.875rem;
    color: var(--st-fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.subtasks__name--done {
    color: var(--st-fg-low);
    text-decoration: line-through;
}

.subtasks__name-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    font-size: 0.875rem;
    color: var(--st-fg);
    padding: 0;
}

.subtasks__meta {
    font-size: 0.75rem;
    color: var(--st-fg-mid);
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
}

.subtasks__meta--mono {
    font-family: ui-monospace, 'Cascadia Code', Menlo, monospace;
    font-size: 0.6875rem;
}

.subtasks__priority-wrap {
    opacity: 0;
    transition: opacity 0.12s;
    flex-shrink: 0;
}

.subtasks__priority-wrap--set {
    opacity: 1;
}

.subtasks__row-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.12s;
    flex-shrink: 0;
}

/* Checkbox */
.subtasks__checkbox {
    position: relative;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
    display: inline-flex;
}

.subtasks__checkbox input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
}

.subtasks__checkbox-box {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid var(--st-fg-faint);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}

.subtasks__checkbox-box--checked {
    border-color: var(--st-primary);
    background: var(--st-primary);
}

.subtasks__checkbox:hover .subtasks__checkbox-box {
    border-color: var(--st-primary);
}

/* Done section */
.subtasks__section-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--st-fg-low);
    padding: 14px 0 4px;
}

.subtasks__empty {
    font-size: 0.8125rem;
    color: var(--st-fg-mid);
    padding: 12px 0 0;
    margin: 0;
}
</style>
