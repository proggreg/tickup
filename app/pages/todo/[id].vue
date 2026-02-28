<script setup lang="ts">
const { params } = useRoute();
const { history } = useRouter().options;
const listsStore = useListsStore();
const parentTodo = ref<Todo | null>(null);

onBeforeMount(async () => {
    const todo = await $fetch<Todo>(`/api/todo/${params.id}`);
    listsStore.setCurrentTodo(todo);
    
    // Explicitly fetch subtasks
    await listsStore.fetchSubtasks(params.id as string);
    
    // If this is a subtask, fetch the parent todo
    if (todo.parentId) {
        parentTodo.value = await $fetch<Todo>(`/api/todo/${todo.parentId}`);
    }
    
    if (todo && todo.listId) {
        const list = await $fetch<List>(`/api/list/${todo.listId}`);
        listsStore.setCurrentList(list);
    }
});
</script>

<template>
    <NuxtErrorBoundary>
        <template #error="{ error }">
            <v-alert type="error">
                {{ error }}
            </v-alert>
        </template>
        <v-col cols="12">
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
                v-else-if="listsStore.currentTodo?.listId"
                data-testid="nav-back-list"
                :to="`/list/${listsStore.currentTodo.listId}`"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-left</v-icon>
                </template>
                {{ listsStore.currentList.name }}
            </v-btn>
            <v-btn
                v-else
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
            <TodoDetail />
        </v-col>
    </NuxtErrorBoundary>
</template>
