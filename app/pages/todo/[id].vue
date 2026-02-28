<script setup lang="ts">
const route = useRoute();
const listsStore = useListsStore();
const parentTodo = ref<Todo | null>(null);
const isLoading = ref(true);
const transitionKey = ref(0);

async function loadTodo(id: string | string[]) {
    try {
        isLoading.value = true;

        const todo = await $fetch<Todo>(`/api/todo/${id}`);
        listsStore.setCurrentTodo(todo);

        // Explicitly fetch subtasks for this todo
        await listsStore.fetchSubtasks(id as string);

        // If this is a subtask, ensure we have the correct parent todo
        if (todo.parentId) {
            const needsNewParent = !parentTodo.value || parentTodo.value.id !== todo.parentId;
            if (needsNewParent) {
                parentTodo.value = await $fetch<Todo>(`/api/todo/${todo.parentId}`);
            }
        }
        else {
            // No parent for this todo
            parentTodo.value = null;
        }

        if (todo && todo.listId) {
            const list = await $fetch<List>(`/api/list/${todo.listId}`);
            listsStore.setCurrentList(list);
        }

        // Only bump the transition key once everything for this todo is loaded,
        // so the fade happens between fully-rendered states.
        transitionKey.value++;
    }
    finally {
        isLoading.value = false;
    }
}

watch(
    () => route.params.id,
    (id) => {
        if (id) loadTodo(id);
    },
    { immediate: true },
);
</script>

<template>
    <NuxtErrorBoundary>
        <template #error="{ error }">
            <v-alert type="error">
                {{ error }}
            </v-alert>
        </template>
        <v-col
            cols="12"
            style="height: 60px"
        >
            <v-btn
                v-if="parentTodo"
                data-testid="nav-back-parent"
                :to="`/todo/${parentTodo.id}`"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-left</v-icon>
                </template>
                {{ parentTodo.name }}
            </v-btn>
            <v-btn
                v-else-if="listsStore.currentTodo?.listId && listsStore.currentList?.id"
                data-testid="nav-back-list"
                :to="`/list/${listsStore.currentTodo.listId}`"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-left</v-icon>
                </template>
                {{ listsStore.currentList.name }}
            </v-btn>
            <v-btn
                v-else-if="!isLoading"
                data-testid="nav-back-home"
                to="/"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-left</v-icon>
                </template>
                Home
            </v-btn>
        </v-col>
        <v-col>
            <Transition name="todo-fade">
                <TodoDetail :key="transitionKey" />
            </Transition>
        </v-col>
    </NuxtErrorBoundary>
</template>

<style scoped>
.todo-fade-enter-active {
    transition: opacity 0.18s ease;
}

.todo-fade-enter-from {
    opacity: 0;
}
</style>
