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
</script>

<template>
    <v-card
        v-if="todos && todos.length"
        variant="flat"
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
                    :key="todo._id"
                    slim
                    nav
                    style="padding: 0 16px !important;"
                    class="pa-0"
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox @click.stop="(el: any) => handleSetClosed(todo, el)" />
                    </template>
                    <v-list-item-title class="text-h6">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle v-if="showDueDates && todo.dueDate">
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>

                    <template #append>
                        <AppDeleteButton :todo="todo" />
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
                    :key="todo._id"
                    slim
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox
                            :model-value="true"
                            @click.stop="(el: any) => handleSetOpen(todo, el)"
                        />
                    </template>
                    <v-list-item-title class="text-h6">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle v-if="showDueDates && todo.dueDate">
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>

                    <template #append>
                        <AppDeleteButton :todo="todo" />
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
                :key="todo._id"
                class="align-center"
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
                <v-list-item-title class="text-h6">
                    {{ todo.name }}
                </v-list-item-title>

                <template #append>
                    <AppDeleteButton :todo="todo" />
                </template>
            </v-list-item>
        </v-list>
    </v-card>
    <v-card
        v-else-if="emptyState"
        variant="flat"
        :class="['d-flex flex-column justify-center align-center']"
    >
        <AppEmptyState height="100%" />
    </v-card>
</template>
