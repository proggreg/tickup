<script setup lang="ts">
import { Button, Checkbox, Popover } from '@vuetify/v0';

interface Props {
    todos: Todo[];
    groupByStatus?: boolean;
    showDueDates?: boolean;
    emptyState?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    groupByStatus: false,
    showDueDates: false,
    emptyState: true,
});

const { selectTodo, setClosed, setOpen, formatDate } = useTodoActions();
const listsStore = useListsStore();
const { isTodoClosed } = useTodoStatus();
const openGroupExpanded = ref(true);
const closedGroupExpanded = ref(false);

const openTodos = computed(() => {
    return props.todos.filter((todo: Todo) => !isTodoClosed(todo.status));
});

const closedTodos = computed(() => {
    return props.todos.filter((todo: Todo) => isTodoClosed(todo.status));
});

const handleSetClosed = (todo: Todo, event?: any) => {
    if (event?.target) {
        event.target.checked = true;
    }
    setClosed(todo, 200);
};

const handleSetOpen = (todo: Todo, event?: any) => {
    if (event?.target) {
        event.target.checked = false;
    }
    setOpen(todo, 200);
};

const handleSetClosedSimple = (todo: Todo) => {
    setClosed(todo);
};

const handleSetOpenSimple = (todo: Todo) => {
    setOpen(todo);
};

const deleteError = ref<string | null>(null);
const deleteConfirmTodo = ref<Todo | null>(null);
const deleteDialogEl = ref<HTMLDialogElement | null>(null);

watch(deleteConfirmTodo, (val) => {
    if (!deleteDialogEl.value) return;
    if (val) { deleteDialogEl.value.showModal(); }
    else { deleteDialogEl.value.close(); }
});

const deleteTodo = async (todo: Todo) => {
    if (!todo.id) return;
    deleteError.value = null;
    try {
        await listsStore.deleteTodo(todo.id);
        deleteConfirmTodo.value = null;
    }
    catch {
        deleteError.value = 'Failed to delete todo. Please try again.';
    }
};
</script>

<template>
    <div
        v-if="todos && todos.length"
        class="todo-list-card"
    >
        <!-- Grouped view (for OverDue) -->
        <template v-if="groupByStatus">
            <!-- Open group -->
            <div class="group">
                <button
                    class="group__header"
                    @click="openGroupExpanded = !openGroupExpanded"
                >
                    <i :class="`mdi ${openGroupExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'} group__chevron`" />
                    <i class="mdi mdi-border-all-variant group__icon" />
                    <span class="group__title">Open</span>
                </button>
                <ul
                    v-if="openGroupExpanded"
                    class="todo-list"
                >
                    <li
                        v-for="todo in openTodos"
                        :key="todo.id"
                        class="todo-list-item"
                        @click="selectTodo(todo)"
                    >
                        <Checkbox.Root
                            class="todo-checkbox"
                            @click.stop="(el: any) => handleSetClosed(todo, el)"
                        >
                            <Checkbox.Indicator class="todo-checkbox__indicator">
                                <i class="mdi mdi-check" />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div class="todo-item__body">
                            <span class="todo-title">{{ todo.name }}</span>
                            <span
                                v-if="showDueDates && todo.dueDate"
                                class="todo-subtitle"
                            >{{ formatDate(todo.dueDate) }}</span>
                        </div>
                        <div class="todo-item__append">
                            <Popover.Root>
                                <Popover.Activator>
                                    <Button.Root
                                        class="icon-btn"
                                        aria-label="Todo options"
                                        @click.stop
                                    >
                                        <Button.Icon>
                                            <i class="mdi mdi-dots-vertical" />
                                        </Button.Icon>
                                    </Button.Root>
                                </Popover.Activator>
                                <Popover.Content>
                                    <ul class="menu-list">
                                        <li
                                            class="menu-item menu-item--danger"
                                            @click.stop="deleteConfirmTodo = todo"
                                        >
                                            <i class="mdi mdi-trash-can" />
                                            Delete
                                        </li>
                                    </ul>
                                </Popover.Content>
                            </Popover.Root>
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
                    <i class="mdi mdi-check-all group__icon" />
                    <span class="group__title">Closed</span>
                </button>
                <ul
                    v-if="closedGroupExpanded"
                    class="todo-list"
                >
                    <li
                        v-for="todo in closedTodos"
                        :key="todo.id"
                        class="todo-list-item"
                        @click="selectTodo(todo)"
                    >
                        <Checkbox.Root
                            class="todo-checkbox todo-checkbox--checked"
                            :checked="true"
                            @click.stop="(el: any) => handleSetOpen(todo, el)"
                        >
                            <Checkbox.Indicator class="todo-checkbox__indicator">
                                <i class="mdi mdi-check" />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div class="todo-item__body">
                            <span class="todo-title">{{ todo.name }}</span>
                            <span
                                v-if="showDueDates && todo.dueDate"
                                class="todo-subtitle"
                            >{{ formatDate(todo.dueDate) }}</span>
                        </div>
                        <div class="todo-item__append">
                            <Popover.Root>
                                <Popover.Activator>
                                    <Button.Root
                                        class="icon-btn"
                                        aria-label="Todo options"
                                        @click.stop
                                    >
                                        <Button.Icon>
                                            <i class="mdi mdi-dots-vertical" />
                                        </Button.Icon>
                                    </Button.Root>
                                </Popover.Activator>
                                <Popover.Content>
                                    <ul class="menu-list">
                                        <li
                                            class="menu-item menu-item--danger"
                                            @click.stop="deleteConfirmTodo = todo"
                                        >
                                            <i class="mdi mdi-trash-can" />
                                            Delete
                                        </li>
                                    </ul>
                                </Popover.Content>
                            </Popover.Root>
                        </div>
                    </li>
                </ul>
            </div>
        </template>

        <!-- Simple list view (for Today/TodayClosed) -->
        <ul
            v-else
            class="todo-list"
        >
            <li
                v-for="todo in todos"
                :key="todo.id"
                class="todo-list-item"
                @click="selectTodo(todo)"
            >
                <Checkbox.Root
                    v-if="!isTodoClosed(todo.status)"
                    class="todo-checkbox"
                    @click.stop="handleSetClosedSimple(todo)"
                >
                    <Checkbox.Indicator class="todo-checkbox__indicator">
                        <i class="mdi mdi-check" />
                    </Checkbox.Indicator>
                </Checkbox.Root>
                <Checkbox.Root
                    v-else
                    class="todo-checkbox todo-checkbox--checked"
                    :checked="true"
                    @click.stop="handleSetOpenSimple(todo)"
                >
                    <Checkbox.Indicator class="todo-checkbox__indicator">
                        <i class="mdi mdi-check" />
                    </Checkbox.Indicator>
                </Checkbox.Root>
                <div class="todo-item__body">
                    <span
                        class="todo-title"
                        data-testid="todo-title"
                    >{{ todo.name }}</span>
                </div>
                <div class="todo-item__append">
                    <Popover.Root>
                        <Popover.Activator>
                            <Button.Root
                                class="icon-btn"
                                aria-label="Todo options"
                                @click.stop
                            >
                                <Button.Icon>
                                    <i class="mdi mdi-dots-vertical" />
                                </Button.Icon>
                            </Button.Root>
                        </Popover.Activator>
                        <Popover.Content>
                            <ul class="menu-list">
                                <li
                                    class="menu-item menu-item--danger"
                                    @click.stop="deleteConfirmTodo = todo"
                                >
                                    <i class="mdi mdi-trash-can" />
                                    Delete
                                </li>
                            </ul>
                        </Popover.Content>
                    </Popover.Root>
                </div>
            </li>
        </ul>
    </div>

    <div
        v-else-if="emptyState"
        class="todo-list-card todo-list-card--empty"
    >
        <AppEmptyState height="100%" />
    </div>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
        <dialog
            ref="deleteDialogEl"
            class="confirm-dialog"
            @close="deleteConfirmTodo = null"
            @click.self="deleteConfirmTodo = null"
        >
            <div class="confirm-dialog__content">
                <p class="confirm-dialog__text">Are you sure you want to delete this todo?</p>
                <p
                    v-if="deleteError"
                    class="confirm-dialog__error"
                >
                    {{ deleteError }}
                </p>
                <div class="confirm-dialog__actions">
                    <Button.Root
                        class="btn btn--danger"
                        @click="deleteConfirmTodo && deleteTodo(deleteConfirmTodo)"
                    >
                        Yes
                    </Button.Root>
                    <Button.Root
                        class="btn"
                        @click="deleteConfirmTodo = null"
                    >
                        No
                    </Button.Root>
                </div>
            </div>
        </dialog>
    </Teleport>

    <!-- Error snackbar -->
    <Teleport to="body">
        <Transition name="snackbar">
            <div
                v-if="deleteError"
                class="error-snackbar"
            >
                {{ deleteError }}
                <Button.Root
                    class="snackbar-close"
                    @click="deleteError = null"
                >
                    <Button.Icon>
                        <i class="mdi mdi-close" />
                    </Button.Icon>
                </Button.Root>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.todo-list-card {
    padding: 4px 0;
}

.todo-list-card--empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    background: rgb(var(--v-theme-surface-container-low));
}

.group__chevron {
    font-size: 18px;
    opacity: 0.5;
}

.group__icon {
    font-size: 18px;
    opacity: 0.7;
}

.group__title {
    font-weight: 600;
    font-size: 0.9375rem;
}

.todo-list {
    list-style: none;
    margin: 0;
    padding: 0 4px;
}

.todo-list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    cursor: pointer;
    min-height: 44px;
    transition: background 0.15s;
}

.todo-list-item:hover {
    background: rgb(var(--v-theme-surface-container-low));
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

.todo-item__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.todo-title {
    font-size: 1.05rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.todo-subtitle {
    font-size: 0.8125rem;
    opacity: 0.7;
}

.todo-item__append {
    flex-shrink: 0;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 120px;
    background: rgb(var(--v-theme-surface-container-lowest));
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(42, 52, 57, 0.1);
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item--danger {
    color: rgb(var(--v-theme-error));
}

.menu-item--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}

/* Confirmation dialog */
.confirm-dialog {
    border: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    padding: 0;
    width: 250px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
}

.confirm-dialog__content {
    padding: 20px;
}

.confirm-dialog__text {
    font-size: 0.9375rem;
    margin: 0 0 8px;
}

.confirm-dialog__error {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-error));
    margin: 0 0 8px;
}

.confirm-dialog__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

.btn {
    display: inline-flex;
    align-items: center;
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    transition: background 0.15s;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.18);
}

.btn--danger {
    background: rgba(var(--v-theme-error), 0.12);
    color: rgb(var(--v-theme-error));
}

.btn--danger:hover {
    background: rgba(var(--v-theme-error), 0.2);
}

/* Error snackbar */
.error-snackbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: rgb(var(--v-theme-error));
    color: #fff;
    border-radius: 8px;
    font-size: 0.875rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 9999;
}

.snackbar-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: #fff;
    padding: 0;
}

.snackbar-enter-active,
.snackbar-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.snackbar-enter-from,
.snackbar-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
}
</style>
