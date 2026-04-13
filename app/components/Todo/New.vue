<script setup lang="ts">
import { Input } from '@vuetify/v0';

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
    <div class="new-todo-field">
        <Input.Root
            v-model="listsStore.newTodo.name"
            class="input-root"
        >
            <Input.Control
                class="input-control"
                data-testid="new-todo-input"
                :placeholder="placeholderText"
                @keyup.enter="addTodo"
            />
        </Input.Root>
        <div class="input-append">
            <AppDueDate
                :todo="listsStore.newTodo"
                :date="listsStore.newTodo.dueDate"
                @set-date="(newDate: Date) => listsStore.newTodo.dueDate = newDate"
            />
        </div>
    </div>
</template>

<style scoped>
.new-todo-field {
    display: flex;
    align-items: center;
    min-width: 150px;
    width: 100%;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    background: transparent;
    padding: 0 8px 0 0;
}

.new-todo-field:focus-within {
    border-color: rgb(var(--v-theme-primary));
}

.input-root {
    flex: 1;
}

.input-control {
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
}

.input-append {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}
</style>
