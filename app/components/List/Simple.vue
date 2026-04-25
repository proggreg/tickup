<script setup lang="ts">
import { Checkbox } from '@vuetify/v0';

const listsStore = useListsStore();

const openGroupExpanded = ref(true);
const closedGroupExpanded = ref(false);
const panelOpen = ref(false);

function selectTodo(todo: Todo) {
    listsStore.setCurrentTodo(todo);
    panelOpen.value = true;
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
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function isOverdue(todo: Todo) {
    if (!todo.dueDate || todo.status === 'Closed') return false;
    const d = new Date(todo.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

const openTodos = computed(() =>
    listsStore.currentList.todos?.filter((t: Todo) => t.status !== 'Closed') ?? [],
);

const closedTodos = computed(() =>
    listsStore.currentList.todos?.filter((t: Todo) => t.status === 'Closed') ?? [],
);
</script>

<template>
    <div class="list-view">
        <div
            v-if="listsStore.currentList.todos?.length"
            class="simple-list"
        >
            <!-- Open group -->
            <div class="group">
                <button
                    class="group__header"
                    @click="openGroupExpanded = !openGroupExpanded"
                >
                    <i :class="`mdi ${openGroupExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'} group__chevron`" />
                    <span class="group__title">Open</span>
                    <span class="group__count">{{ openTodos.length }}</span>
                </button>

                <ul
                    v-if="openGroupExpanded"
                    class="todo-list"
                >
                    <li
                        v-for="todo in openTodos"
                        :key="todo.id"
                        class="todo-item"
                        :class="{
                            'todo-item--selected': listsStore.currentTodo?.id === todo.id && panelOpen,
                        }"
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
                                :class="{ 'todo-subtitle--overdue': isOverdue(todo) }"
                            >
                                <i
                                    v-if="isOverdue(todo)"
                                    class="mdi mdi-alert-circle-outline"
                                    style="font-size: 11px"
                                />
                                {{ formatDate(todo.dueDate) }}
                            </span>
                        </div>

                        <i class="mdi mdi-chevron-right todo-item__arrow" />
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
                    <span class="group__title">Closed</span>
                    <span class="group__count">{{ closedTodos.length }}</span>
                </button>

                <ul
                    v-if="closedGroupExpanded"
                    class="todo-list"
                >
                    <li
                        v-for="todo in closedTodos"
                        :key="todo.id"
                        class="todo-item todo-item--closed"
                        :class="{
                            'todo-item--selected': listsStore.currentTodo?.id === todo.id && panelOpen,
                        }"
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

                        <i class="mdi mdi-chevron-right todo-item__arrow" />
                    </li>
                </ul>
            </div>
        </div>

        <div
            v-else
            class="empty-wrapper"
        >
            <AppEmptyState />
        </div>

        <!-- Side panel -->
        <Transition name="panel">
            <TodoPanel
                v-if="panelOpen && listsStore.currentTodo?.id"
                class="floating-panel"
                @close="panelOpen = false"
            />
        </Transition>
    </div>
</template>

<style scoped>
.list-view {
    height: 100%;
    overflow-y: auto;
    padding: 4px 0 40px;
}

.simple-list {
    padding: 0;
}

.group {
    margin-bottom: 4px;
}

.group__header {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 12px;
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
    font-size: 16px;
    color: rgba(var(--v-theme-on-surface), 0.4);
}

.group__title {
    font-weight: 600;
    font-size: 0.8125rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.group__count {
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.35);
    margin-left: 2px;
}

.todo-list {
    list-style: none;
    margin: 0;
    padding: 0 4px;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 1px;
    border-left: 3px solid transparent;
    transition: background 0.1s;
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

.todo-item__arrow {
    font-size: 15px;
    color: rgba(var(--v-theme-on-surface), 0.25);
    opacity: 0;
    transition: opacity 0.1s;
    flex-shrink: 0;
}

.todo-item:hover .todo-item__arrow,
.todo-item--selected .todo-item__arrow {
    opacity: 1;
}

.todo-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    border: 2px solid rgba(var(--v-border-color), 0.38);
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
    color: rgb(var(--v-theme-on-primary));
    font-size: 10px;
}

.todo-checkbox:not(.todo-checkbox--checked) .todo-checkbox__indicator {
    display: none;
}

.todo-item__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.todo-title {
    font-weight: 500;
    font-size: 0.9375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(var(--v-theme-on-surface));
}

.todo-title--closed {
    text-decoration: line-through;
}

.todo-subtitle {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.45);
    display: flex;
    align-items: center;
    gap: 3px;
}

.todo-subtitle--overdue {
    color: rgb(var(--v-theme-tertiary));
    font-weight: 500;
}

.empty-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 48px 24px;
}

.floating-panel {
    position: fixed;
    top: 64px;
    right: 0;
    bottom: 0;
    z-index: 300;
    box-shadow: -4px 0 32px rgba(42, 52, 57, 0.12);
}

.panel-enter-active,
.panel-leave-active {
    transition: transform 0.22s ease, opacity 0.22s;
}

.panel-enter-from,
.panel-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
