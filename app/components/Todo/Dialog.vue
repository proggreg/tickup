<script setup lang="ts">
const dialog = useDialog();
const listsStore = useListsStore();
const { notify } = useNotification();

async function addTodo() {
    const todo = await listsStore.addTodo();
    if (todo.id) {
        dialog.value.open = false;
        notify('Todo Created', { link: `/todo/${todo.id}` });
    }
}
</script>

<template>
    <AppDialog
        page="todo"
        title="New Todo"
    >
        <TodoNew />
        <ListSelect />
        <template #buttons>
            <v-btn
                color="primary"
                :disabled="listsStore.newTodo.name === ''"
                data-testid="create-todo-button"
                @click="addTodo"
            >
                Create
            </v-btn>
        </template>
    </AppDialog>
</template>
