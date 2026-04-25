<script lang="ts" setup>
import { Popover } from '@vuetify/v0';
import { useDisplay } from 'vuetify';

const listsStore = useListsStore();
const { statuses } = useSettingsStore();
const { smAndDown } = useDisplay();

const props = defineProps<{
    todos: Todo[];
    status: string;
}>();

const emit = defineEmits(['TodoClicked', 'updateTodos']);

const today = new Date();
today.setHours(0, 0, 0, 0);

function isOverdue(todo: Todo) {
    if (!todo.dueDate || todo.status === 'Closed') return false;
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

function isToday(todo: Todo) {
    if (!todo.dueDate) return false;
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
}

function formatDue(todo: Todo) {
    if (!todo.dueDate) return '';
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === -1) return 'Yesterday';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo);
    emit('TodoClicked');
}

function toggleStatus(todo: Todo) {
    todo.status = todo.status === 'Closed' ? 'Open' : 'Closed';
    $fetch(`/api/todo/${todo.id}`, { method: 'PUT', body: todo });
}

function setStatus(todo: Todo, status: Status) {
    todo.status = status.name;
    $fetch(`/api/todo/${todo.id}`, { method: 'PUT', body: todo });
}

const isSelected = (todo: Todo) =>
    listsStore.currentTodo?.id === todo.id;
</script>

<template>
    <template
        v-for="todo in props.todos"
        :key="todo.id"
    >
        <div
            v-if="todo.status === props.status"
            class="todo-item"
            :class="{
                'todo-item--selected': isSelected(todo),
                'todo-item--closed': todo.status === 'Closed',
            }"
            @click="selectTodo(todo); emit('TodoClicked')"
        >
            <!-- Checkbox / status toggle -->
            <div class="todo-item__check">
                <Popover.Root>
                    <Popover.Activator>
                        <button
                            class="check-btn"
                            :class="{ 'check-btn--done': todo.status === 'Closed' }"
                            :aria-label="`Toggle ${todo.name}`"
                            @click.stop="toggleStatus(todo)"
                        >
                            <i
                                v-if="todo.status === 'Closed'"
                                class="mdi mdi-check check-btn__icon"
                            />
                        </button>
                    </Popover.Activator>
                    <Popover.Content>
                        <ul class="status-menu">
                            <li
                                v-for="s in statuses"
                                :key="s.name"
                                class="status-menu__item"
                                @click.stop="setStatus(todo, s)"
                            >
                                <span
                                    class="status-menu__dot"
                                    :style="{ background: s.color }"
                                />
                                {{ s.name }}
                            </li>
                        </ul>
                    </Popover.Content>
                </Popover.Root>
            </div>

            <!-- Title -->
            <div class="todo-item__title">
                {{ todo.name }}
            </div>

            <!-- Due date -->
            <div
                v-if="todo.dueDate && !smAndDown"
                class="todo-item__due"
                :class="{
                    'todo-item__due--overdue': isOverdue(todo),
                    'todo-item__due--today': isToday(todo),
                }"
            >
                <i
                    v-if="isOverdue(todo)"
                    class="mdi mdi-alert-circle-outline"
                    style="font-size: 12px"
                />
                {{ formatDue(todo) }}
            </div>
        </div>
    </template>
</template>

<style scoped>
.todo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background 0.1s;
    user-select: none;
}

.todo-item:hover {
    background: rgba(var(--v-border-color), 0.07);
}

.todo-item--selected {
    background: rgb(var(--v-theme-primary-container));
    border-left-color: rgb(var(--v-theme-primary));
}

.todo-item--selected:hover {
    background: rgb(var(--v-theme-primary-container));
}

.todo-item--closed {
    opacity: 0.6;
}

.todo-item__check {
    flex-shrink: 0;
}

.check-btn {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 2px solid rgba(var(--v-border-color), 0.38);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;
    padding: 0;
    flex-shrink: 0;
}

.check-btn:hover {
    border-color: rgb(var(--v-theme-primary));
}

.check-btn--done {
    background: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
}

.check-btn__icon {
    font-size: 10px;
    color: rgb(var(--v-theme-on-primary));
}

.todo-item__title {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(var(--v-theme-on-surface));
}

.todo-item--closed .todo-item__title {
    text-decoration: line-through;
}

.todo-item__due {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.45);
    display: flex;
    align-items: center;
    gap: 3px;
}

.todo-item__due--overdue {
    color: rgb(var(--v-theme-tertiary));
    font-weight: 500;
}

.todo-item__due--today {
    color: rgb(var(--v-theme-primary));
    font-weight: 500;
}

.status-menu {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 140px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.status-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;
}

.status-menu__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.status-menu__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
