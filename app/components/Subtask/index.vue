<script setup lang="ts">
const listsStore = useListsStore();
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

async function addSubtask() {
    if (!newSubtaskName.value || !listsStore.currentTodo?.id) return;
    await listsStore.addSubtask(newSubtaskName.value, listsStore.currentTodo.id);
    newSubtaskName.value = '';
}

async function deleteSubtask(subtaskId: string | number) {
    await listsStore.deleteSubtask(subtaskId);
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
            class="d-flex align-center mt-4"
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
                @click="addSubtask"
            />
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
                        :data-testid="`subtask-item-${index}`"
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
                                    @change="listsStore.updateTodo(subtask)"
                                />
                            </div>
                        </template>
                        <v-text-field
                            v-model="subtask.name"
                            hide-details
                            variant="plain"
                            :readonly="subtask.status === 'Closed'"
                            :class="{ 'text-decoration-line-through text-disabled': subtask.status === 'Closed' }"
                            :data-testid="`subtask-name-${index}`"
                            @blur="listsStore.updateTodo(subtask)"
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
                                    <v-btn
                                        icon="mdi-open-in-new"
                                        size="small"
                                        variant="text"
                                        density="compact"
                                        class="mr-1"
                                        :data-testid="`subtask-link-${index}`"
                                        :to="`/todo/${subtask.id}`"
                                    />
                                </v-col>
                                <v-col>
                                    <v-btn
                                        icon="mdi-delete"
                                        size="small"
                                        variant="text"
                                        density="compact"
                                        :data-testid="`subtask-delete-${index}`"
                                        @click="deleteSubtask(subtask.id)"
                                    />
                                </v-col>
                            </v-row>
                        </template>
                        <v-divider
                            v-if="index < filteredAndSortedSubtasks.length - 1"
                            class="my-1"
                        />
                    </v-list-item>
                </template>
            </v-virtual-scroll>
        </v-expand-transition>
    </div>
</template>
