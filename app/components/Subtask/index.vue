<script setup lang="ts">
const listsStore = useListsStore();
const newSubtaskName = ref('');
const subtasksExpanded = ref(true);
const completedCount = computed(() => {
    if (!listsStore.currentTodo.subtasks) return 0;
    return listsStore.currentTodo.subtasks.filter(
        subtask => subtask.status === 'Closed',
    ).length;
});

const activeCount = computed(() => {
    if (!listsStore.currentTodo.subtasks) return 0;
    return listsStore.currentTodo.subtasks.filter(
        subtask => subtask.status !== 'Closed',
    ).length;
});

const subtasksFilter = ref<'all' | 'active'>('all');
const subtasksSortBy = ref<'none' | 'priority'>('none');

function getPriorityColor(priority: string | undefined): string {
    if (!priority) return 'grey';
    switch (priority.toLowerCase()) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'grey';
    }
}

function getPriorityIcon(priority: string | undefined): string {
    if (!priority) return 'mdi-flag-outline';
    switch (priority.toLowerCase()) {
        case 'high': return 'mdi-flag';
        case 'medium': return 'mdi-flag';
        case 'low': return 'mdi-flag';
        default: return 'mdi-flag-outline';
    }
}

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
            return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
        });
    }

    return filtered;
});

async function addSubtask() {
    if (!newSubtaskName.value || !listsStore.currentTodo?.id) return;
    await listsStore.addSubtask(newSubtaskName.value, listsStore.currentTodo.id);
    newSubtaskName.value = '';
}

async function deleteSubtask(subtaskId: string | number) {
    await listsStore.deleteSubtask(subtaskId);
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
            <div class="d-flex align-center">
                <v-tooltip
                    v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                    location="bottom"
                >
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            :icon="subtasksSortBy === 'priority' ? 'mdi-sort-variant' : 'mdi-sort-variant'"
                            :color="subtasksSortBy === 'priority' ? 'primary' : 'grey-darken-1'"
                            variant="tonal"
                            size="x-small"
                            class="mx-2"
                            data-testid="subtasks-sort-button"
                            @click.stop="subtasksSortBy = subtasksSortBy === 'priority' ? 'none' : 'priority'"
                        />
                    </template>
                    <span>{{ subtasksSortBy === 'priority' ? 'Sorted by priority (click to unsort)' : 'Click to sort by priority' }}</span>
                </v-tooltip>
                <v-spacer v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length" />
                <div
                    v-if="listsStore.currentTodo.subtasks && listsStore.currentTodo.subtasks.length"
                    class="d-flex align-center"
                    data-testid="subtasks-filter"
                >
                    <v-btn
                        :variant="subtasksFilter === 'all' ? 'tonal' : 'outlined'"
                        :color="subtasksFilter === 'all' ? 'primary' : undefined"
                        size="small"
                        data-testid="filter-all"
                        class="px-3"
                        @click.stop="subtasksFilter = 'all'"
                    >
                        All
                    </v-btn>
                    <v-btn
                        :variant="subtasksFilter === 'active' ? 'tonal' : 'outlined'"
                        :color="subtasksFilter === 'active' ? 'primary' : undefined"
                        size="small"
                        data-testid="filter-active"
                        class="px-3 ml-2"
                        @click.stop="subtasksFilter = 'active'"
                    >
                        Active
                    </v-btn>
                </div>
                <v-btn
                    :icon="subtasksExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    variant="text"
                    size="x-small"
                    density="compact"
                    class="ml-2"
                    data-testid="subtasks-toggle"
                    @click="subtasksExpanded = !subtasksExpanded"
                />
            </div>
        </div>
        <v-expand-transition>
            <div v-show="subtasksExpanded">
                <div
                    v-if="filteredAndSortedSubtasks.length"
                    class="subtasks-scrollable-container"
                >
                    <v-list
                        density="compact"
                        class="pa-0"
                        data-testid="subtasks-list"
                    >
                        <v-list-item
                            v-for="(subtask, idx) in filteredAndSortedSubtasks"
                            :key="subtask.id"
                            class="py-2 px-0 align-center"
                            :data-testid="`subtask-item-${idx}`"
                        >
                            <template #prepend>
                                <div class="d-flex align-center">
                                    <v-checkbox
                                        v-model="subtask.status"
                                        :true-value="'Closed'"
                                        :false-value="'Open'"
                                        density="compact"
                                        class="mr-1"
                                        :data-testid="`subtask-checkbox-${idx}`"
                                        @change="listsStore.updateTodo(subtask)"
                                    />
                                    <v-menu>
                                        <template #activator="{ props }">
                                            <v-btn
                                                v-bind="props"
                                                :icon="getPriorityIcon(subtask.priority)"
                                                :color="getPriorityColor(subtask.priority)"
                                                size="small"
                                                variant="text"
                                                density="compact"
                                                :data-testid="`subtask-priority-${idx}`"
                                            />
                                        </template>
                                        <v-list density="compact">
                                            <v-list-item
                                                :data-testid="`subtask-priority-high-${idx}`"
                                                @click="subtask.priority = 'high'; listsStore.updateTodo(subtask)"
                                            >
                                                <template #prepend>
                                                    <v-icon color="error">
                                                        mdi-flag
                                                    </v-icon>
                                                </template>
                                                <v-list-item-title>High</v-list-item-title>
                                            </v-list-item>
                                            <v-list-item
                                                :data-testid="`subtask-priority-medium-${idx}`"
                                                @click="subtask.priority = 'medium'; listsStore.updateTodo(subtask)"
                                            >
                                                <template #prepend>
                                                    <v-icon color="warning">
                                                        mdi-flag
                                                    </v-icon>
                                                </template>
                                                <v-list-item-title>Medium</v-list-item-title>
                                            </v-list-item>
                                            <v-list-item
                                                :data-testid="`subtask-priority-low-${idx}`"
                                                @click="subtask.priority = 'low'; listsStore.updateTodo(subtask)"
                                            >
                                                <template #prepend>
                                                    <v-icon color="success">
                                                        mdi-flag
                                                    </v-icon>
                                                </template>
                                                <v-list-item-title>Low</v-list-item-title>
                                            </v-list-item>
                                            <v-list-item
                                                :data-testid="`subtask-priority-none-${idx}`"
                                                @click="subtask.priority = null; listsStore.updateTodo(subtask)"
                                            >
                                                <template #prepend>
                                                    <v-icon color="grey">
                                                        mdi-flag-outline
                                                    </v-icon>
                                                </template>
                                                <v-list-item-title>None</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </template>
                            <v-text-field
                                v-model="subtask.name"
                                hide-details
                                variant="plain"
                                :readonly="subtask.status === 'Closed'"
                                :class="{ 'text-decoration-line-through text-disabled': subtask.status === 'Closed' }"
                                :data-testid="`subtask-name-${idx}`"
                                @blur="listsStore.updateTodo(subtask)"
                            />
                            <template #append>
                                <div class="d-flex align-center">
                                    <v-btn
                                        icon="mdi-open-in-new"
                                        size="x-small"
                                        variant="text"
                                        density="compact"
                                        class="mr-1"
                                        :data-testid="`subtask-link-${idx}`"
                                        :to="`/todo/${subtask.id}`"
                                    />
                                    <v-btn
                                        icon="mdi-delete"
                                        size="x-small"
                                        variant="text"
                                        density="compact"
                                        :data-testid="`subtask-delete-${idx}`"
                                        @click="deleteSubtask(subtask.id)"
                                    />
                                </div>
                            </template>
                            <v-divider
                                v-if="idx < filteredAndSortedSubtasks.length - 1"
                                class="my-1"
                            />
                        </v-list-item>
                    </v-list>
                </div>
                <div
                    v-else-if="!listsStore.currentTodo.subtasks || !listsStore.currentTodo.subtasks.length"
                    class="text-grey text-body-2 pa-2"
                >
                    No subtasks yet. Add one below!
                </div>
                <div
                    v-else
                    class="text-grey text-body-2 pa-2"
                    data-testid="no-active-subtasks"
                >
                    All subtasks completed! 🎉
                </div>
                <div class="d-flex align-center mt-4">
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
                        @click="addSubtask"
                    />
                </div>
            </div>
        </v-expand-transition>
    </div>
</template>
