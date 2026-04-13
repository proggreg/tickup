<script setup lang="ts">
import { Checkbox } from '@vuetify/v0';

const listsStore = useListsStore();
const openGroupExpanded = ref(true);
const closedGroupExpanded = ref(false);

function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo);
    navigateTo(`/todo/${todo.id}`);
}
function setClosed(todo: Todo) {
    todo.status = 'Closed';
    listsStore.updateTodo(todo);
}
function setOpen(todo: Todo) {
    todo.status = 'Open';
    listsStore.updateTodo(todo);
}
function formatDate(date: Date) {
    if (!date) {
        return '';
    }
    return new Date(date).toLocaleDateString('en-GB');
}

const openTodos = computed(() => {
    return listsStore.currentList.todos?.filter((todo: Todo) => todo.status !== 'Closed');
});

const closedTodos = computed(() => {
    return listsStore.currentList.todos?.filter((todo: Todo) => todo.status === 'Closed');
});
</script>

<template>
    <div
        v-if="listsStore.currentList.todos && listsStore.currentList.todos.length"
        class="simple-list"
    >
        <!-- Open group -->
        <div class="group">
            <button
                class="group__header"
                @click="openGroupExpanded = !openGroupExpanded"
            >
                <i :class="`mdi ${openGroupExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'} group__chevron`" />
                <span class="group__title">Open ({{ openTodos.length }})</span>
            </button>
            <ul
                v-if="openGroupExpanded"
                class="todo-list"
            >
                <li
                    v-for="todo in openTodos"
                    :key="todo.id"
                    class="todo-item"
                    @click="selectTodo(todo)"
                >
                    <Checkbox.Root
                        class="todo-checkbox"
                        @click.stop="setClosed(todo)"
                    >
                        <Checkbox.Indicator class="todo-checkbox__indicator">
                            <i class="mdi mdi-check" />
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <div class="todo-item__content">
                        <span
                            class="todo-title"
                            data-testid="todo-title"
                        >{{ todo.name }}</span>
                        <span
                            v-if="todo.dueDate"
                            class="todo-subtitle"
                        >{{ formatDate(todo.dueDate) }}</span>
                    </div>
                    <div class="todo-item__append">
                        <AppDeleteButton :todo="todo" />
                    </div>
                </li>
            </ul>
        </div>

        <!-- Closed group -->
        <div class="group">
            <button
                class="group__header"
                @click="closedGroupExpanded = !closedGroupExpanded"
            >
                <i :class="`mdi ${closedGroupExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'} group__chevron`" />
                <span class="group__title">Closed ({{ closedTodos.length }})</span>
            </button>
            <ul
                v-if="closedGroupExpanded"
                class="todo-list"
            >
                <li
                    v-for="todo in closedTodos"
                    :key="todo.id"
                    class="todo-item"
                    @click="selectTodo(todo)"
                >
                    <Checkbox.Root
                        class="todo-checkbox todo-checkbox--checked"
                        :checked="true"
                        @click.stop="setOpen(todo)"
                    >
                        <Checkbox.Indicator class="todo-checkbox__indicator">
                            <i class="mdi mdi-check" />
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <div class="todo-item__content">
                        <span class="todo-title todo-title--closed">{{ todo.name }}</span>
                        <span
                            v-if="todo.dueDate"
                            class="todo-subtitle"
                        >{{ formatDate(todo.dueDate) }}</span>
                    </div>
                    <div class="todo-item__append">
                        <AppDeleteButton :todo="todo" />
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <div
        v-else
        class="empty-wrapper"
    >
        <AppEmptyState height="100%" />
    </div>
</template>

<style scoped>
.simple-list {
    background: transparent;
    padding: 4px 0;
}

.group {
    margin-bottom: 4px;
}

.group__header {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 8px;
    font-family: inherit;
    transition: background 0.1s;
}

.group__header:hover {
    background: rgba(var(--v-border-color), 0.06);
}

.group__chevron {
    font-size: 18px;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.group__title {
    font-weight: 600;
    letter-spacing: 0.01em;
    font-size: 0.9375rem;
}

@media (max-width: 600px) {
    .group__title {
        font-size: 1rem;
    }
}

.todo-list {
    list-style: none;
    margin: 0;
    padding: 0 4px;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 16px;
    cursor: pointer;
    margin-bottom: 2px;
    transition: background 0.1s;
}

.todo-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.todo-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(var(--v-border-color), 0.4);
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
}

.todo-checkbox:hover {
    border-color: rgb(var(--v-theme-primary));
}

.todo-checkbox--checked {
    background: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
}

.todo-checkbox__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
}

.todo-checkbox:not(.todo-checkbox--checked) .todo-checkbox__indicator {
    display: none;
}

.todo-item__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.todo-title {
    font-weight: 500;
    font-size: 1.05rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 600px) {
    .todo-title {
        font-size: 1.1rem;
        line-height: 1.4;
    }
}

.todo-title--closed {
    text-decoration: line-through;
    opacity: 0.5;
}

.todo-subtitle {
    font-size: 0.8125rem;
    opacity: 0.8;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

@media (max-width: 600px) {
    .todo-subtitle {
        font-size: 0.9rem;
    }
}

.todo-item__append {
    flex-shrink: 0;
}

.empty-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: transparent;
}
</style>
