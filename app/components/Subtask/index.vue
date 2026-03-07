<script setup lang="ts">
import { nextTick } from 'vue';

const listsStore = useListsStore();
const router = useRouter();
const newSubtaskName = ref('');
const subtasksExpanded = ref(true);

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
    if (!priority) return 4; // No priority set
    const p = priority.toLowerCase();
    if (p === 'high') return 1;
    if (p === 'medium') return 2;
    if (p === 'low') return 3;
    return 4; // Unknown priority
};

const filteredAndSortedSubtasks = computed(() => {
    if (!listsStore.currentTodo.subtasks) return [];

    let filtered = [...listsStore.currentTodo.subtasks];

    // Apply filter
    if (subtasksFilter.value === 'active') {
        filtered = filtered.filter(subtask => subtask.status !== 'Closed');
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
        // Exclude the current todo, existing subtasks, and any item that already has a parent
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
    // Backend does not allow subtask-of-subtask
    if ((todo as any).parentId) return;

    todo.parentId = listsStore.currentTodo.id;
    const updated = await listsStore.updateTodo(todo);

    if (!listsStore.currentTodo.subtasks) listsStore.currentTodo.subtasks = [];
    // Avoid duplicates
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
    <div class="pa-4 rounded-lg">
        <div class="d-flex align-center justify-space-between mb-2">
            <div
                class="text-subtitle-1 font-weight-bold d-flex align-center flex-grow-1"
                style="cursor: pointer;"
                data-testid="subtasks-header"
                @click="subtasksExpanded = !subtasksExpanded"
            >
                <span class="mr-2">Subtasks</span>
                <v-chip
                    v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                    size="small"
                    variant="tonal"
                    color="primary"
                >
                    {{ activeCount }}/{{ listsStore.currentTodo.subtasks.length }}
                </v-chip>
            </div>
            <SubtaskFilters
                v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                v-model:filter="subtasksFilter"
                v-model:sort-by="subtasksSortBy"
                v-model:expanded="subtasksExpanded"
                :has-subtasks="!!(listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length)"
            />
        </div>
        <div
            v-show="subtasksExpanded"
            class="d-flex align-center my-4"
        >
            <v-text-field
                v-model="newSubtaskName"
                label="Add subtask"
                hide-details
                variant="outlined"
                class="me-2 flex-grow-1"
                style="min-width: 120px;"
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
            <v-menu
                :width="400"
                location="bottom"
            >
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
                        <v-list-item-title>
                            No tasks available to link
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else-if="baseLinkableTodos.length && !linkableTodos.length">
                        <v-list-item-title>
                            No tasks match your search
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <v-expand-transition>
            <v-virtual-scroll
                v-show="subtasksExpanded"
                height="300"
                :items="filteredAndSortedSubtasks"
                data-testid="subtasks-list"
            >
                <template #default="{ item: subtask, index }">
                    <v-list-item
                        :key="subtask.id"
                        class="py-2 px-0 align-center"
                        style="cursor: pointer;"
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
                            :class="{ 'text-decoration-line-through text-disabled': subtask.status === 'Closed' }"
                            @click.stop="navigateToSubtask(subtask.id)"
                        >
                            {{ subtask.name }}
                        </div>
                        <v-text-field
                            v-else
                            :ref="el => subtaskNameRefs[index] = el"
                            v-model="subtask.name"
                            hide-details
                            variant="plain"
                            :class="{ 'text-decoration-line-through text-disabled': subtask.status === 'Closed' }"
                            :data-testid="`subtask-name-input-${index}`"
                            @blur="onSubtaskBlur(subtask)"
                        />
                        <template #append>
                            <v-row
                                class="d-flex align-center gap-4"
                                min-width="500px"
                            >
                                <v-col>
                                    <SubtaskPriority
                                        :subtask="subtask"
                                        :index="index"
                                        @update-priority="(level) => updatePriority(subtask, level)"
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
                                                    <v-icon>
                                                        mdi-pencil
                                                    </v-icon>
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
                                                    <v-icon color="error">
                                                        mdi-delete
                                                    </v-icon>
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
                    </v-list-item>
                </template>
            </v-virtual-scroll>
        </v-expand-transition>
    </div>
</template>

<style scoped>
.subtask-name-readonly {
    cursor: pointer;
    text-decoration: none;
}
</style>
