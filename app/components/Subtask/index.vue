<script setup lang="ts">
import { nextTick } from 'vue';
import { Button, Checkbox, Input, Popover } from '@vuetify/v0';

const listsStore = useListsStore();
const router = useRouter();
const newSubtaskName = ref('');
const subtasksExpanded = ref(false);

const activeCount = computed(() => {
    if (!listsStore.currentTodo.subtasks) return 0;
    return listsStore.currentTodo.subtasks.filter(
        subtask => subtask.status !== 'Closed',
    ).length;
});

const subtasksFilter = ref<'all' | 'active'>('all');
const subtasksSortBy = ref<'none' | 'priority'>('none');

const subtaskNameRefs = ref<any[]>([]);
const editingSubtaskIds = ref<(string | number)[]>([]);
const linkSearch = ref('');

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

    if (subtasksFilter.value === 'active') {
        filtered = filtered.filter(subtask => subtask.status !== 'Closed');
    }

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
        todos = todos.filter(todo => todo.name?.toLowerCase().includes(q));
    }

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
    if (!listsStore.currentTodo.subtasks.some(st => st.id === updated.id)) {
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
        nextTick(() => {
            input.focus();
        });
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
</script>

<template>
    <div class="subtasks-panel">
        <!-- Panel header -->
        <button
            class="subtasks-header"
            data-testid="subtasks-header"
            @click="subtasksExpanded = !subtasksExpanded"
        >
            <div class="subtasks-header__left">
                <span class="subtasks-header__title">Subtasks</span>
                <span
                    v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                    class="subtasks-badge"
                >
                    {{ activeCount }}/{{ listsStore.currentTodo.subtasks.length }}
                </span>
            </div>
            <div class="subtasks-header__right">
                <SubtaskFilters
                    v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                    v-model:filter="subtasksFilter"
                    v-model:sort-by="subtasksSortBy"
                    :expanded="subtasksExpanded"
                    :has-subtasks="!!(listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length)"
                    @update:expanded="subtasksExpanded = $event"
                    @click.stop
                />
                <i :class="`mdi ${subtasksExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'} subtasks-header__chevron`" />
            </div>
        </button>

        <!-- Panel body -->
        <div
            v-if="subtasksExpanded"
            class="subtasks-body"
        >
            <!-- Add subtask row -->
            <div class="subtasks-add-row">
                <Input.Root
                    v-model="newSubtaskName"
                    class="subtasks-add-input-root"
                >
                    <Input.Control
                        class="subtasks-add-input"
                        placeholder="Add subtask"
                        data-testid="add-subtask-input"
                        @keyup.enter="addSubtask"
                    />
                </Input.Root>
                <Button.Root
                    class="icon-btn icon-btn--primary"
                    :disabled="!newSubtaskName"
                    data-testid="add-subtask-button"
                    @click="addSubtask"
                >
                    <Button.Icon>
                        <i class="mdi mdi-plus" />
                    </Button.Icon>
                </Button.Root>

                <!-- Link existing todo -->
                <Popover.Root>
                    <Popover.Activator>
                        <Button.Root
                            class="icon-btn"
                            data-testid="link-subtask-button"
                        >
                            <Button.Icon>
                                <i class="mdi mdi-link-plus" />
                            </Button.Icon>
                        </Button.Root>
                    </Popover.Activator>
                    <Popover.Content>
                        <div class="link-menu">
                            <div class="link-menu__search">
                                <Input.Root v-model="linkSearch">
                                    <Input.Control
                                        class="link-search-input"
                                        placeholder="Search tasks"
                                        data-testid="link-subtask-search"
                                        @click.stop
                                    />
                                </Input.Root>
                            </div>
                            <hr class="link-menu__divider">
                            <ul class="link-menu__list">
                                <li
                                    v-if="!baseLinkableTodos.length"
                                    class="link-menu__empty"
                                >
                                    No tasks available to link
                                </li>
                                <li
                                    v-else-if="baseLinkableTodos.length && !linkableTodos.length"
                                    class="link-menu__empty"
                                >
                                    No tasks match your search
                                </li>
                                <li
                                    v-for="todo in linkableTodos"
                                    :key="todo.id"
                                    class="link-menu__item"
                                    :data-testid="`link-subtask-option-${todo.id}`"
                                    @click="linkExistingTodo(todo)"
                                >
                                    {{ todo.name }}
                                </li>
                            </ul>
                        </div>
                    </Popover.Content>
                </Popover.Root>
            </div>

            <!-- Subtask list -->
            <ul
                class="subtasks-list"
                data-testid="subtasks-list"
            >
                <li
                    v-for="(subtask, index) in filteredAndSortedSubtasks"
                    :key="subtask.id"
                    class="subtask-item"
                    :data-testid="`subtask-item-${index}`"
                    @click="navigateToSubtask(subtask.id)"
                >
                    <Checkbox.Root
                        v-model="subtask.status"
                        true-value="Closed"
                        false-value="Open"
                        class="subtask-checkbox"
                        :class="{ 'subtask-checkbox--checked': subtask.status === 'Closed' }"
                        :data-testid="`subtask-checkbox-${index}`"
                        @click.stop
                        @change="listsStore.updateTodo(subtask)"
                    >
                        <Checkbox.Indicator class="subtask-checkbox__indicator">
                            <i class="mdi mdi-check" />
                        </Checkbox.Indicator>
                    </Checkbox.Root>

                    <div
                        v-if="subtask.status === 'Closed' || !isEditingSubtask(subtask.id)"
                        class="subtask-name"
                        :class="{ 'subtask-name--closed': subtask.status === 'Closed' }"
                        :data-testid="`subtask-name-${index}`"
                        @click.stop="navigateToSubtask(subtask.id)"
                    >
                        {{ subtask.name }}
                    </div>
                    <Input.Root
                        v-else
                        v-model="subtask.name"
                        class="subtask-name-input-root"
                    >
                        <Input.Control
                            :ref="el => subtaskNameRefs[index] = el"
                            class="subtask-name-input"
                            :class="{ 'subtask-name-input--closed': subtask.status === 'Closed' }"
                            :data-testid="`subtask-name-input-${index}`"
                            @click.stop
                            @blur="onSubtaskBlur(subtask)"
                        />
                    </Input.Root>

                    <div class="subtask-item__actions">
                        <SubtaskPriority
                            :subtask="subtask"
                            :index="index"
                            @update-priority="(level) => updatePriority(subtask, level)"
                        />
                        <Popover.Root>
                            <Popover.Activator>
                                <Button.Root
                                    class="icon-btn"
                                    :data-testid="`subtask-menu-${index}`"
                                    @click.stop
                                >
                                    <Button.Icon>
                                        <i class="mdi mdi-dots-vertical" />
                                    </Button.Icon>
                                </Button.Root>
                            </Popover.Activator>
                            <Popover.Content>
                                <ul class="menu-list">
                                    <li
                                        class="menu-item"
                                        :data-testid="`subtask-rename-${index}`"
                                        @click="renameSubtask(subtask.id, index)"
                                    >
                                        <i class="mdi mdi-pencil" />
                                        Rename subtask
                                    </li>
                                    <li
                                        class="menu-item menu-item--danger"
                                        :data-testid="`subtask-delete-${index}`"
                                        @click="deleteSubtask(subtask.id)"
                                    >
                                        <i class="mdi mdi-delete" />
                                        Delete subtask
                                    </li>
                                </ul>
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.subtasks-panel {
    border-radius: 8px;
    overflow: hidden;
}

.subtasks-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 0;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: background 0.1s;
}

.subtasks-header:hover {
    background: rgba(var(--v-border-color), 0.04);
}

.subtasks-header__left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.subtasks-header__right {
    display: flex;
    align-items: center;
    gap: 4px;
}

.subtasks-header__title {
    font-size: 0.875rem;
    font-weight: 700;
}

.subtasks-header__chevron {
    font-size: 18px;
    opacity: 0.5;
}

.subtasks-badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.subtasks-body {
    padding: 8px 0;
}

.subtasks-add-row {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
}

.subtasks-add-input-root {
    flex: 1;
    min-width: 120px;
}

.subtasks-add-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.subtasks-add-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.1s;
}

.icon-btn:hover:not(:disabled) {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.icon-btn .mdi {
    font-size: 18px;
}

.icon-btn--primary {
    color: rgb(var(--v-theme-primary));
}

.icon-btn--primary:hover:not(:disabled) {
    background: rgba(var(--v-theme-primary), 0.1);
}

/* Link menu */
.link-menu {
    width: 400px;
    max-width: calc(100vw - 32px);
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    overflow: hidden;
}

.link-menu__search {
    padding: 8px;
}

.link-search-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.link-search-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.link-menu__divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.1);
    margin: 0;
}

.link-menu__list {
    list-style: none;
    margin: 0;
    padding: 4px;
    max-height: 200px;
    overflow-y: auto;
}

.link-menu__empty {
    padding: 10px 12px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.link-menu__item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.link-menu__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

/* Subtask list */
.subtasks-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
}

.subtask-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    cursor: pointer;
    transition: background 0.1s;
}

.subtask-item:hover {
    background: rgba(var(--v-border-color), 0.04);
}

.subtask-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(var(--v-border-color), 0.4);
    border-radius: 3px;
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
}

.subtask-checkbox:hover {
    border-color: rgb(var(--v-theme-primary));
}

.subtask-checkbox--checked {
    background: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
}

.subtask-checkbox__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
}

.subtask-checkbox:not(.subtask-checkbox--checked) .subtask-checkbox__indicator {
    display: none;
}

.subtask-name {
    flex: 1;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.subtask-name--closed {
    text-decoration: line-through;
    opacity: 0.5;
}

.subtask-name-input-root {
    flex: 1;
}

.subtask-name-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.9rem;
    color: inherit;
    font-family: inherit;
    padding: 2px 4px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.38);
    box-sizing: border-box;
}

.subtask-name-input--closed {
    text-decoration: line-through;
    opacity: 0.5;
}

.subtask-item__actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    min-width: 80px;
}

/* Context menus */
.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 160px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item--danger {
    color: rgb(var(--v-theme-error));
}

.menu-item--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}
</style>
