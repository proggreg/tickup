<script setup lang="ts">
interface Props {
    todos: Task[];
    groupByStatus?: boolean;
    showDueDates?: boolean;
    emptyState?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    groupByStatus: false,
    showDueDates: false,
    emptyState: true,
});

// const { isMobile } = useDevice()
const { selectTodo, setClosed, setOpen, formatDate } = useTodoActions();
const listsStore = useListsStore();
const { isTodoClosed } = useTodoStatus();
const opened = ref(['Open']);

const openTodos = computed(() => {
    return props.todos.filter((todo: Task) => !isTodoClosed(todo.status));
});

const closedTodos = computed(() => {
    return props.todos.filter((todo: Task) => isTodoClosed(todo.status));
});

const handleSetClosed = (todo: Task, event?: any) => {
    if (event?.target) {
        event.target.checked = true;
    }
    setClosed(todo, 200);
};

const handleSetOpen = (todo: Task, event?: any) => {
    if (event?.target) {
        event.target.checked = false;
    }
    setOpen(todo, 200);
};

const handleSetClosedSimple = (todo: Task) => {
    setClosed(todo);
};

const handleSetOpenSimple = (todo: Task) => {
    setOpen(todo);
};

const longPressTodo = ref<Task | null>(null);
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const showActionSheet = ref(false);
const showDeleteConfirm = ref(false);

const startLongPress = (todo: Task) => {
    longPressTimer.value = setTimeout(() => {
        longPressTodo.value = todo;
        showActionSheet.value = true;
    }, 500);
};

const endLongPress = () => {
    if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
    }
};

const deleteError = ref<string | null>(null);

const deleteTodo = async () => {
    if (!longPressTodo.value?.id) return;
    deleteError.value = null;
    try {
        await listsStore.deleteTodo(longPressTodo.value.id);
        showDeleteConfirm.value = false;
        showActionSheet.value = false;
        longPressTodo.value = null;
    } catch {
        deleteError.value = 'Failed to delete todo. Please try again.';
    }
};
</script>

<template>
    <v-card v-if="todos && todos.length" variant="flat" class="todo-list-card">
        <!-- Grouped view (for OverDue) -->
        <v-list v-if="groupByStatus" :opened="opened" variant="plain" class="grouped-list">
            <v-list-group value="Open">
                <template #activator="{ props: activatorProps }">
                    <v-list-item v-bind="activatorProps" slim class="grouped-header">
                        <template #prepend>
                            <v-icon icon="mdi-circle-outline" size="20" class="group-icon" />
                        </template>
                        <v-list-item-title class="todo-title font-weight-bold"
                            >Open</v-list-item-title
                        >
                    </v-list-item>
                </template>

                <v-list-item
                    v-for="todo in openTodos"
                    :key="todo.id"
                    slim
                    class="todo-list-item"
                    @click="selectTodo(todo)"
                    @touchstart.passive="startLongPress(todo)"
                    @touchend="endLongPress"
                    @touchmove="endLongPress"
                    @mousedown="startLongPress(todo)"
                    @mouseup="endLongPress"
                    @mouseleave="endLongPress"
                >
                    <template #prepend>
                        <v-checkbox
                            size="20"
                            density="compact"
                            @click.stop="(el: any) => handleSetClosed(todo, el)"
                        />
                    </template>
                    <v-list-item-title class="todo-title">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle v-if="showDueDates && todo.dueDate">
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>
                </v-list-item>
            </v-list-group>

            <v-list-group value="Closed">
                <template #activator="{ props: activatorProps }">
                    <v-list-item v-bind="activatorProps" slim class="grouped-header">
                        <template #prepend>
                            <v-icon icon="mdi-check-all" size="20" class="group-icon" />
                        </template>
                        <v-list-item-title class="todo-title font-weight-bold"
                            >Closed</v-list-item-title
                        >
                    </v-list-item>
                </template>

                <v-list-item
                    v-for="todo in closedTodos"
                    :key="todo.id"
                    slim
                    class="todo-list-item"
                    @click="selectTodo(todo)"
                    @touchstart.passive="startLongPress(todo)"
                    @touchend="endLongPress"
                    @touchmove="endLongPress"
                    @mousedown="startLongPress(todo)"
                    @mouseup="endLongPress"
                    @mouseleave="endLongPress"
                >
                    <template #prepend>
                        <v-checkbox
                            size="20"
                            density="compact"
                            :model-value="true"
                            @click.stop="(el: any) => handleSetOpen(todo, el)"
                        />
                    </template>
                    <v-list-item-title class="todo-title">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle v-if="showDueDates && todo.dueDate">
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>
                </v-list-item>
            </v-list-group>
        </v-list>

        <!-- Simple list view (for Today/TodayClosed) -->
        <v-list
            v-else
            variant="plain"
            :class="closedTodos.length > 0 && openTodos.length === 0 ? 'pa-4' : ''"
        >
            <v-list-item
                v-for="todo in todos"
                :key="todo.id"
                slim
                class="align-center todo-list-item"
                style="
                    min-height: 40px;
                    padding-top: 2px;
                    padding-bottom: 2px;
                    padding-left: 4px;
                    padding-right: 4px;
                "
                @click="selectTodo(todo)"
                @touchstart.passive="startLongPress(todo)"
                @touchend="endLongPress"
                @touchmove="endLongPress"
                @mousedown="startLongPress(todo)"
                @mouseup="endLongPress"
                @mouseleave="endLongPress"
            >
                <template #prepend>
                    <v-checkbox
                        v-if="!isTodoClosed(todo.status)"
                        density="compact"
                        @click.stop="handleSetClosedSimple(todo)"
                    />
                    <v-checkbox
                        v-else
                        density="compact"
                        :model-value="true"
                        @click.stop="handleSetOpenSimple(todo)"
                    />
                </template>
                <v-list-item-title class="todo-title" data-testid="todo-title">
                    {{ todo.name }}
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
    <v-card
        v-else-if="emptyState"
        variant="flat"
        class="todo-list-card d-flex flex-column justify-center align-center"
    >
        <AppEmptyState height="100%" />
    </v-card>

    <v-bottom-sheet v-model="showActionSheet">
        <v-list>
            <v-list-subheader v-if="longPressTodo">
                {{ longPressTodo.name }}
            </v-list-subheader>
            <v-divider />
            <v-list-item
                prepend-icon="mdi-trash-can"
                title="Delete"
                base-color="red"
                @click="
                    showActionSheet = false;
                    showDeleteConfirm = true;
                "
            />
        </v-list>
    </v-bottom-sheet>

    <v-dialog v-model="showDeleteConfirm" width="250px">
        <v-card>
            <v-card-text>Are you sure you want to delete this todo?</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="red" @click="deleteTodo">Yes</v-btn>
                <v-btn @click="showDeleteConfirm = false">No</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar
        :model-value="!!deleteError"
        color="error"
        timeout="4000"
        @update:model-value="deleteError = null"
    >
        {{ deleteError }}
    </v-snackbar>
</template>

<style scoped>
.todo-list-card {
    background: rgba(255, 255, 255, 0.08) !important;
    border-radius: 24px !important;
}

.todo-list-item {
    border-radius: 16px !important;
    margin-bottom: 2px;
    transition: background 0.2s;
}

.todo-list-item :deep(.v-list-item__prepend) {
    margin-right: 8px;
}

.todo-list-item :deep(.v-checkbox) {
    margin-right: 0;
}

.todo-list-item:hover {
    background: rgba(255, 255, 255, 0.06) !important;
}

.todo-title {
    font-size: 0.875rem !important;
}

:deep(.grouped-list .v-list-group__items) {
    --indent-padding: 0px;
    --list-indent-size: 0px;
}

:deep(.grouped-list .v-list-group__items .v-list-item) {
    padding-inline-start: 8px !important;
}

:deep(.grouped-list > .v-list-item) {
    padding-inline-start: 8px !important;
}

.grouped-header :deep(.v-list-item__prepend) {
    width: 40px;
    margin-right: 8px;
    justify-content: center;
}

.group-icon {
    opacity: 0.7;
}
</style>
