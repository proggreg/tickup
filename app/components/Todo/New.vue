<script setup lang="ts">
const listsStore = useListsStore();
const dialog = useDialog();
const placeholderText = computed(() => {
    if (listsStore.currentList.name) {
        return 'Add todo to ' + listsStore.currentList.name;
    }
    return 'Add todo';
});

function addTodo() {
    listsStore.addTodo();
    dialog.value.open = false;
}
</script>

<template>
    <v-text-field
        v-model="listsStore.newTodo.name"
        min-width="150"
        width="100%"
        data-testid="new-todo-input"
        :placeholder="placeholderText"
        @keyup.enter="addTodo"
    >
        <template #append-inner>
            <AppDueDate
                :todo="listsStore.newTodo"
                :date="listsStore.newTodo.dueDate"
                @set-date="(newDate: Date) => listsStore.newTodo.dueDate = newDate"
            />
        </template>
    </v-text-field>
    <ListSelect />
</template>

<style>
  input {
    height: 100%;
  }
</style>
