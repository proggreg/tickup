<script setup lang="ts">
const listsStore = useListsStore();
// const { isMobile } = useDevice()
const opened = ref(['Open']);

function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo);
    navigateTo(`/todo/${todo.id}`);
}
function setClosed(todo: Todo) {
    todo.status = 'Closed';
    listsStore.updateTodo(todo);
}
function setOpen(todo: Todo) {
    todo.status = 'Open';
    listsStore.updateTodo(todo);
}
function formatDate(date: Date) {
    if (!date) {
        return '';
    }
    return new Date(date).toLocaleDateString('en-GB');
}

const openTodos = computed(() => {
    return listsStore.currentList.todos?.filter((todo: Todo) => todo.status !== 'Closed');
});

const closedTodos = computed(() => {
    return listsStore.currentList.todos?.filter((todo: Todo) => todo.status === 'Closed');
});
</script>

<template>
    <v-card
        v-if="listsStore.currentList.todos && listsStore.currentList.todos.length"
        variant="flat"
    >
        <v-list
            :opened="opened"
            variant="plain"
        >
            <v-list-group
                value="Open"
                fluid
            >
                <template #activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        :title="`Open (${openTodos.length})`"
                        class="todo-group-header"
                    />
                </template>

                <v-list-item
                    v-for="todo in openTodos"
                    :key="todo.id"
                    slim
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox @click.stop="setClosed(todo)" />
                    </template>
                    <v-list-item-title
                        data-testid="todo-title"
                        class="todo-title text-truncate"
                    >
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle
                        v-if="todo.dueDate"
                        class="todo-subtitle"
                    >
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>

                    <template #append>
                        <AppDeleteButton :todo="todo" />
                    </template>
                </v-list-item>
            </v-list-group>

            <v-list-group
                value="Closed"
                fluid
            >
                <template #activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        :title="`Closed (${closedTodos.length})`"
                        class="todo-group-header"
                    />
                </template>

                <v-list-item
                    v-for="todo in closedTodos"
                    :key="todo.id"
                    slim
                    @click="selectTodo(todo)"
                >
                    <template #prepend>
                        <v-checkbox
                            :model-value="true"
                            @click.stop="setOpen(todo)"
                        />
                    </template>
                    <v-list-item-title class="todo-title text-truncate">
                        {{ todo.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle
                        v-if="todo.dueDate"
                        class="todo-subtitle"
                    >
                        {{ formatDate(todo.dueDate) }}
                    </v-list-item-subtitle>

                    <template #append>
                        <AppDeleteButton :todo="todo" />
                    </template>
                </v-list-item>
            </v-list-group>
        </v-list>
    </v-card>
    <v-card
        v-else
        variant="flat"
        :class="['d-flex flex-column justify-center align-center']"
    >
        <AppEmptyState height="100%" />
    </v-card>
</template>

<style scoped>
.todo-group-header :deep(.v-list-item-title) {
    font-weight: 600;
    letter-spacing: 0.01em;
}

.todo-title {
    font-weight: 500;
}

.todo-subtitle {
    opacity: 0.8;
}

@media (max-width: 600px) {
    .todo-group-header :deep(.v-list-item-title) {
        font-size: 1rem; /* ~16px, slightly larger on mobile */
    }

    .todo-title {
        font-size: 1.1rem; /* ~17.6px, similar to many mobile todo apps */
        line-height: 1.4;
    }

    .todo-subtitle {
        font-size: 0.9rem; /* ~14.4px */
    }
}
</style>
