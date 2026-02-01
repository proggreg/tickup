<script setup lang="ts">
const { params } = useRoute();
const { history } = useRouter().options;
const listsStore = useListsStore();

onBeforeMount(() => {
    $fetch(`/api/todo/${params.id}`).then((todo: Todo) => {
        listsStore.setCurrentTodo(todo as Todo);
        if (todo && todo.listId) {
            $fetch(`/api/list/${todo.listId}`).then((list) => {
                listsStore.setCurrentList(list as List);
            });
        }
    });
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
                data-testid="nav-back-list"
                :to="history.state.back as string"
            >
                <template #prepend>
                    <v-icon>mdi-arrow-left</v-icon>
                </template>
                <span v-if="history.state.back !== '/'">
                    {{ listsStore.currentList.name }}
                </span>
            </v-btn>
        </v-col>
        <v-col>
            <TodoDetail />
        </v-col>
    </NuxtErrorBoundary>
</template>
