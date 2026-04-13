<script setup lang="ts">
import { Button, Checkbox, Input } from '@vuetify/v0';

const isAddingTodo = ref(false);
const listsStore = useListsStore();

interface Props {
    status: Status;
    selectedClass?: string;
}

const { status } = defineProps<Props>();

const todos = computed(() => {
    if (!listsStore.currentList || !listsStore.currentList.todos || !listsStore.currentList.todos.length || !status || !status.name) {
        return [];
    }
    return listsStore.currentList.todos.filter((todo: Todo) => todo.status === status.name);
});

function addTodo(status: Status) {
    listsStore.newTodo.status = status.name;
    listsStore.addTodo();
}

function handleBlur() {
    if (!listsStore.newTodo.name) {
        isAddingTodo.value = false;
    }
}

function handleDragChange(evt: any) {
    if (evt?.added?.element) {
        const todo = evt.added.element as Todo;
        if (todo.status !== status.name) {
            todo.status = status.name;
            listsStore.updateTodo(todo);
        }
    }
}
</script>

<template>
    <div
        class="board-column"
        :class="selectedClass"
        :style="{ '--col-color': status.color }"
    >
        <div class="board-column__header">
            <div class="board-column__title-row">
                <span class="board-column__title">{{ status.name }}</span>
                <Button.Root
                    class="icon-btn"
                    @click="isAddingTodo = !isAddingTodo"
                >
                    <Button.Icon>
                        <i class="mdi mdi-plus" />
                    </Button.Icon>
                </Button.Root>
                <BoardOptions :status="status" />
            </div>
        </div>

        <div class="board-column__body">
            <draggable
                :list="todos"
                item-key="id"
                group="status"
                class="draggable-container"
                @change="handleDragChange"
            >
                <template #item="{ element: todo }">
                    <NuxtLink
                        :key="todo.id"
                        :to="`/todo/${todo.id}`"
                        class="todo-card"
                        :style="{ '--card-color': status.color }"
                    >
                        <div class="todo-card__inner">
                            <Checkbox.Root
                                v-model="todo.selected"
                                class="todo-card__checkbox"
                                @click.stop
                            >
                                <Checkbox.Indicator class="todo-card__checkbox-indicator">
                                    <i class="mdi mdi-check" />
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <span class="todo-card__name">{{ todo.name }}</span>
                        </div>
                    </NuxtLink>
                </template>
            </draggable>
        </div>

        <div
            v-if="isAddingTodo"
            class="board-column__add"
        >
            <div class="add-todo-card">
                <Input.Root v-model="listsStore.newTodo.name">
                    <Input.Control
                        class="add-todo-input"
                        placeholder="Add todo"
                        autofocus
                        @blur="handleBlur"
                        @keyup.enter.stop="addTodo(status)"
                    />
                </Input.Root>
            </div>
        </div>
    </div>
</template>

<style scoped>
.board-column {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 400px;
    margin: 0 8px;
    background: rgba(var(--v-border-color), 0.06);
    border-radius: 12px;
    overflow: hidden;
    font-weight: bold;
}

.board-column__header {
    padding: 12px 12px 8px;
    background: color-mix(in srgb, var(--col-color, transparent) 15%, transparent);
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.board-column__title-row {
    display: flex;
    align-items: center;
    gap: 4px;
}

.board-column__title {
    flex: 1;
    font-size: 0.9375rem;
    font-weight: 700;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: var(--col-color, inherit);
    padding: 0;
    transition: background 0.1s;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}

.board-column__body {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
}

.draggable-container {
    min-height: 100%;
}

.todo-card {
    display: block;
    margin-bottom: 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--card-color, transparent) 12%, rgb(var(--v-theme-surface)));
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: box-shadow 0.15s;
}

.todo-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.todo-card__inner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
}

.todo-card__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(var(--v-border-color), 0.4);
    border-radius: 3px;
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
}

.todo-card__checkbox:hover {
    border-color: rgb(var(--v-theme-primary));
}

.todo-card__checkbox-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--v-theme-primary));
    font-size: 11px;
}

.todo-card__name {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .board-column {
        min-width: 0;
        width: 100%;
    }
}

.board-column__add {
    padding: 8px;
}

.add-todo-card {
    background: rgb(var(--v-theme-surface));
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.add-todo-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    font-family: inherit;
    color: inherit;
    padding: 2px 0;
}
</style>
