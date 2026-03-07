<script setup lang="ts">
interface Props {
    todos: Todo[];
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
const opened = ref(['Open']);

const openTodos = computed(() => {
    return props.todos.filter((todo: Todo) => todo.status !== 'Closed');
});

const closedTodos = computed(() => {
    return props.todos.filter((todo: Todo) => todo.status === 'Closed');
});

const handleSetClosed = (todo: Todo, event?: any) => {
    if (event?.target) {
        event.target.checked = true;
    }
    setClosed(todo, 200);
};

const handleSetOpen = (todo: Todo, event?: any) => {
    if (event?.target) {
        event.target.checked = false;
    }
    setOpen(todo, 200);
};

const handleSetClosedSimple = (todo: Todo) => {
    setClosed(todo);
};

const handleSetOpenSimple = (todo: Todo) => {
    setOpen(todo);
};

const deleteTodo = async (todo: Todo) => {
    if (!todo.id) return;
    await listsStore.deleteTodo(todo.id);
};
</script>

<template>
    <v-card
        v-if="todos && todos.length"
        variant="flat"
        class="todo-list-card"
    >
        <!-- Grouped view (for OverDue) -->
        <v-list
            v-if="groupByStatus"
            :opened="opened"
            variant="plain"
        >
            <v-list-group value="Open">
                <template #activator="{ props: activatorProps }">
                    <v-list-item
                        v-bind="activatorProps"
                        prepend-icon="mdi mdi-border-all-variant"
                        title="Open"
                    />
                </template>

                <v-list-item
                    v-for="todo in openTodos"
                    :key="todo.id"
                    slim
                    nav
                    style="padding: 0 16px !important;"
                    class="pa-0 todo-list-item"
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox @click.stop="(el: any) => handleSetClosed(todo, el)" />
                    </template>
                    <v-list-item-title class="todo-title">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle v-if="showDueDates && todo.dueDate">
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>

                    <template #append>
                        <v-menu>
                            <template #activator="{ props: menuProps }">
                                <v-btn
                                    v-bind="menuProps"
                                    icon="mdi-dots-vertical"
                                    variant="text"
                                    size="small"
                                    @click.stop
                                />
                            </template>
                            <v-list>
                                <v-dialog width="250px">
                                    <template #activator="{ props: dialogProps }">
                                        <v-list-item
                                            v-bind="dialogProps"
                                            prepend-icon="mdi-trash-can"
                                            title="Delete"
                                            base-color="red"
                                            @click.stop
                                        />
                                    </template>
                                    <template #default="{ isActive }">
                                        <v-card>
                                            <v-card-text>Are you sure you want to delete this todo?</v-card-text>
                                            <v-card-actions>
                                                <v-spacer />
                                                <v-btn color="red" @click="deleteTodo(todo); isActive.value = false">Yes</v-btn>
                                                <v-btn @click="isActive.value = false">No</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </template>
                                </v-dialog>
                            </v-list>
                        </v-menu>
                    </template>
                </v-list-item>
            </v-list-group>

            <v-list-group value="Closed">
                <template #activator="{ props: activatorProps }">
                    <v-list-item
                        v-bind="activatorProps"
                        prepend-icon="mdi mdi-check-all"
                        title="Closed"
                    />
                </template>

                <v-list-item
                    v-for="todo in closedTodos"
                    :key="todo.id"
                    slim
                    class="todo-list-item"
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox
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

                    <template #append>
                        <v-menu>
                            <template #activator="{ props: menuProps }">
                                <v-btn
                                    v-bind="menuProps"
                                    icon="mdi-dots-vertical"
                                    variant="text"
                                    size="small"
                                    @click.stop
                                />
                            </template>
                            <v-list>
                                <v-dialog width="250px">
                                    <template #activator="{ props: dialogProps }">
                                        <v-list-item
                                            v-bind="dialogProps"
                                            prepend-icon="mdi-trash-can"
                                            title="Delete"
                                            base-color="red"
                                            @click.stop
                                        />
                                    </template>
                                    <template #default="{ isActive }">
                                        <v-card>
                                            <v-card-text>Are you sure you want to delete this todo?</v-card-text>
                                            <v-card-actions>
                                                <v-spacer />
                                                <v-btn color="red" @click="deleteTodo(todo); isActive.value = false">Yes</v-btn>
                                                <v-btn @click="isActive.value = false">No</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </template>
                                </v-dialog>
                            </v-list>
                        </v-menu>
                    </template>
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
                class="align-center todo-list-item"
                @click="selectTodo(todo)"
            >
                <template #prepend>
                    <v-checkbox
                        v-if="todo.status !== 'Closed'"
                        @click.stop="handleSetClosedSimple(todo)"
                    />
                    <v-checkbox
                        v-else
                        :model-value="true"
                        @click.stop="handleSetOpenSimple(todo)"
                    />
                </template>
                <v-list-item-title
                    class="todo-title"
                    data-testid="todo-title"
                >
                    {{ todo.name }}
                </v-list-item-title>

                <template #append>
                    <v-menu>
                        <template #activator="{ props: menuProps }">
                            <v-btn
                                v-bind="menuProps"
                                icon="mdi-dots-vertical"
                                variant="text"
                                size="small"
                                @click.stop
                            />
                        </template>
                        <v-list>
                            <v-dialog width="250px">
                                <template #activator="{ props: dialogProps }">
                                    <v-list-item
                                        v-bind="dialogProps"
                                        prepend-icon="mdi-trash-can"
                                        title="Delete"
                                        base-color="red"
                                        @click.stop
                                    />
                                </template>
                                <template #default="{ isActive }">
                                    <v-card>
                                        <v-card-text>Are you sure you want to delete this todo?</v-card-text>
                                        <v-card-actions>
                                            <v-spacer />
                                            <v-btn color="red" @click="deleteTodo(todo); isActive.value = false">Yes</v-btn>
                                            <v-btn @click="isActive.value = false">No</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </template>
                            </v-dialog>
                        </v-list>
                    </v-menu>
                </template>
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

.todo-list-item:hover {
    background: rgba(255, 255, 255, 0.06) !important;
}

.todo-title {
    font-size: 1.05rem !important;
}
</style>
