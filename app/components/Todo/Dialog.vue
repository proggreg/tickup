<script setup lang="ts">
import { Button } from '@vuetify/v0';

const dialog = useDialog();
const listsStore = useListsStore();
const { notify } = useNotification();
const { mobile } = useDisplay();

const isOpen = computed(() => dialog.value.open && dialog.value.page === 'todo');

const name = ref('');
const dueDate = ref<Date | undefined>(undefined);
const selectedListId = ref<string | null>(null);

const todo = computed<Todo>(() => ({
    name: name.value,
    dueDate: dueDate.value,
    listId: selectedListId.value ?? undefined,
    status: 'Open',
    desc: '',
    edit: false,
    color: '#87909e',
    links: [],
    attachments: [],
    priorityLev: '',
}));

function close() {
    dialog.value.open = false;
}

function resetState() {
    dialog.value.page = '';
    name.value = '';
    dueDate.value = undefined;
    selectedListId.value = null;
}

async function addTodo() {
    const created = await listsStore.addTodo(todo.value);
    if (created.id) {
        close();
        notify('Todo Created', { link: `/todo/${created.id}` });
    }
}

// Programmatic dialog control via native <dialog> element
const dialogEl = ref<HTMLDialogElement | null>(null);

watch(isOpen, (val) => {
    if (!dialogEl.value) return;
    if (val) {
        dialogEl.value.showModal();
        nextTick(() => {
            dialogEl.value?.querySelector<HTMLInputElement>('[data-testid="new-todo-input"]')?.focus();
        });
    }
    else {
        dialogEl.value.close();
    }
});
</script>

<template>
    <dialog
        ref="dialogEl"
        class="todo-dialog"
        :class="{ 'todo-dialog--mobile': mobile }"
        @close="resetState"
        @click.self="close"
    >
        <div class="todo-dialog__card">
            <div class="todo-dialog__header">
                <span
                    class="todo-dialog__label"
                    data-testid="dialog-title"
                >
                    New Task
                </span>
                <Button.Root
                    class="icon-btn"
                    aria-label="Close"
                    data-testid="dialog-close"
                    @click="close"
                >
                    <Button.Icon>
                        <i class="mdi mdi-close" />
                    </Button.Icon>
                </Button.Root>
            </div>

            <div class="todo-dialog__body">
                <input
                    v-model="name"
                    class="todo-input"
                    placeholder="What needs to be done?"
                    data-testid="new-todo-input"
                    @keyup.enter="addTodo"
                />

                <div class="todo-dialog__row">
                    <div class="todo-dialog__list-col">
                        <ListSelect
                            v-model="selectedListId"
                            label="List"
                            variant="plain"
                            density="compact"
                        />
                    </div>
                    <div class="todo-dialog__date-col">
                        <AppDueDate
                            :todo="todo"
                            :todo-due-date="dueDate"
                            @set-date="(newDate: Date) => dueDate = newDate"
                        />
                    </div>
                </div>
            </div>

            <div class="todo-dialog__actions">
                <Button.Root
                    class="btn btn--subtle"
                    @click="close"
                >
                    <Button.Content>Cancel</Button.Content>
                </Button.Root>
                <Button.Root
                    class="btn btn--primary"
                    :disabled="name === ''"
                    data-testid="create-todo-button"
                    @click="addTodo"
                >
                    <Button.Content>Save Task</Button.Content>
                </Button.Root>
            </div>
        </div>
    </dialog>
</template>

<style scoped>
.todo-dialog {
    border: none;
    border-radius: 12px;
    padding: 0;
    max-width: 576px;
    width: 90vw;
    background: transparent;
    overflow: visible;
    margin: auto;
}

.todo-dialog--mobile {
    margin-top: 0;
    align-self: flex-start;
}

.todo-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.todo-dialog__card {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border: 1px solid rgba(var(--v-theme-outline-variant), 0.3);
    border-radius: 12px;
    box-shadow: 0 24px 40px -10px rgba(0, 90, 194, 0.08);
    overflow: hidden;
    position: relative;
}

.todo-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 8px;
}

.todo-dialog__label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
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
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 16px;
}

.todo-dialog__body {
    padding: 8px 24px 24px;
}

.todo-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.24);
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    font-size: 1.4rem;
    font-weight: 500;
    padding: 4px 0 8px;
    margin-bottom: 16px;
    outline: none;
    box-sizing: border-box;
}

.todo-input::placeholder {
    color: rgb(var(--v-theme-outline));
    opacity: 1;
}

.todo-input:focus {
    border-bottom-color: rgb(var(--v-theme-primary));
}

.todo-dialog__row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.todo-dialog__list-col {
    flex: 1;
    min-width: 0;
}

.todo-dialog__date-col {
    flex-shrink: 0;
}

.todo-dialog__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(var(--v-theme-surface-variant), 0.15);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
}

.btn--subtle {
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.btn--subtle:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary, 255, 255, 255));
}

.btn--primary:hover {
    opacity: 0.9;
}

.btn--primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
