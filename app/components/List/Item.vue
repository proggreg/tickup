<script lang="ts" setup>
import { Popover } from '@vuetify/v0';

const listsStore = useListsStore();
const { statuses } = useSettingsStore();
const { smAndDown } = useDisplay();
const itemProps = defineProps<{
    todos: Todo[];
    status: string;
}>();

const emit = defineEmits(['TodoClicked', 'updateTodos']);

function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo);
}

function editTodo(todo: Todo, status: Status) {
    todo.status = status.name;
    $fetch(`/api/todo/${todo.id}`, {
        method: 'PUT',
        body: todo,
    });
}
</script>

<template>
    <template
        v-for="(todo, index) in itemProps.todos"
        :key="index"
    >
        <div
            v-if="todo.status == itemProps.status"
            class="todo-item"
            @click="emit('TodoClicked')"
        >
            <div class="todo-item__prepend">
                <Popover.Root>
                    <Popover.Activator>
                        <span>
                            <ListStatus :todo="todo" />
                        </span>
                    </Popover.Activator>
                    <Popover.Content>
                        <ul class="status-menu">
                            <li
                                v-for="statusItem in statuses"
                                :key="statusItem.name"
                                class="status-menu__item"
                                @click.stop="editTodo(todo, statusItem)"
                            >
                                {{ statusItem.name }}
                            </li>
                        </ul>
                    </Popover.Content>
                </Popover.Root>
            </div>

            <div
                class="todo-item__title"
                @click="selectTodo(todo)"
            >
                {{ todo.name }}
            </div>

            <div class="todo-item__append">
                <AppDueDate
                    :todo="todo"
                    :todo-due-date="todo.dueDate"
                    :show-detail="!smAndDown"
                />
            </div>
        </div>
    </template>
</template>

<style scoped>
.todo-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s;
}

.todo-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.todo-item__prepend {
    flex-shrink: 0;
}

.todo-item__title {
    flex: 1;
    font-size: 0.9375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.todo-item__append {
    flex-shrink: 0;
}

.status-menu {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 120px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.status-menu__item {
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;
}

.status-menu__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
