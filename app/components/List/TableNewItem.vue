<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';

const newTodoVariant = ref<'text' | 'outlined'>('text');
const openNewTodo = ref(false);
const listStore = useListsStore();
const newTodo = ref(createNewTodoState());

const { groupItem } = defineProps<{
    groupItem: Record<string, unknown>;
}>();

async function createTodo(status: string) {
    newTodo.value.status = status;
    if (newTodo.value.name) {
        await listStore.addTodo(newTodo.value);
        newTodo.value = createNewTodoState();
        openNewTodo.value = false;
    }
}
</script>

<template>
    <tr>
        <td
            v-if="!openNewTodo"
            colspan="5"
        >
            <Button.Root
                class="add-btn"
                @click="openNewTodo = true"
                @mouseover="newTodoVariant = 'outlined'"
                @mouseleave="newTodoVariant = 'text'"
            >
                <Button.Content>Add Todo</Button.Content>
            </Button.Root>
        </td>

        <td
            v-else
            colspan="5"
        >
            <Input.Root v-model="newTodo.name">
                <Input.Control
                    class="table-input"
                    autofocus
                    placeholder="new todo"
                    data-testid="table-new-todo-input"
                    @blur="createTodo(groupItem.value as string)"
                    @keyup.enter="($event.target as HTMLInputElement).blur()"
                />
            </Input.Root>
        </td>
    </tr>
</template>

<style scoped>
.add-btn {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.add-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
    color: rgb(var(--v-theme-on-surface));
}

.table-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.38);
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    padding: 4px 0;
    outline: none;
}

.table-input:focus {
    border-bottom-color: rgb(var(--v-theme-primary));
}
</style>
