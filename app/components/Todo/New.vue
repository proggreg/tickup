<script setup lang="ts">
const listsStore = useListsStore();

function addTodo() {
    listsStore.addTodo();
}
</script>

<template>
    <v-text-field
        v-if="listsStore.currentList"
        v-model="listsStore.newTodo.name"
        min-width="150"
        width="100%"
        data-testid="new-todo-input"
        :placeholder="'Add todo to ' + listsStore.currentList.name"
        @keyup.enter="addTodo"
    >
        <template #append-inner>
            <AppDueDate
                :todo="listsStore.newTodo"
                :date="listsStore.newTodo.dueDate"
                @set-date="(newDate: Date) => listsStore.newTodo.dueDate = newDate"
            />

            <v-btn
                :disabled="!listsStore.newTodo.name"
                size="small"
                variant="text"
                icon="mdi-plus"
                @click="addTodo"
            />
        </template>
    </v-text-field>
</template>

<style>
  input {
    height: 100%;
  }
</style>
