<script setup lang="ts">
import { Button, Dialog } from '@vuetify/v0';

const listsStore = useListsStore();
const { todo } = defineProps<{
    todo: Todo;
}>();

async function deleteTodo() {
    if (!todo.id) {
        console.error(new Error('No todo id provided'), { component: 'DeleteButton', todo });
        return;
    }
    await listsStore.deleteTodo(todo.id);
}
</script>

<template>
    <Dialog.Root>
        <Dialog.Activator>
            <Button.Root
                class="icon-btn icon-btn--danger"
                aria-label="Delete todo"
            >
                <Button.Icon>
                    <i class="mdi mdi-trash-can" />
                </Button.Icon>
            </Button.Root>
        </Dialog.Activator>

        <Dialog.Content class="confirm-dialog">
            <Dialog.Title class="confirm-dialog__title">
                Delete todo
            </Dialog.Title>
            <Dialog.Description class="confirm-dialog__body">
                Are you sure you want to delete this todo?
            </Dialog.Description>
            <div class="confirm-dialog__actions">
                <Dialog.Close>
                    <Button.Root class="btn">
                        <Button.Content>No</Button.Content>
                    </Button.Root>
                </Dialog.Close>
                <Dialog.Close>
                    <Button.Root
                        class="btn btn--danger"
                        @click="deleteTodo"
                    >
                        <Button.Content>Yes</Button.Content>
                    </Button.Root>
                </Dialog.Close>
            </div>
        </Dialog.Content>
    </Dialog.Root>
</template>

<style scoped>
/* Icon trigger button */
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--danger .mdi {
    color: rgb(var(--v-theme-error));
}

.icon-btn .mdi {
    font-size: 20px;
}

/* Dialog */
.confirm-dialog {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border: none;
    border-radius: 12px;
    padding: 24px;
    width: 250px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

.confirm-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.confirm-dialog__title {
    font-size: 1rem;
    font-weight: 500;
    margin: 0 0 12px;
}

.confirm-dialog__body {
    font-size: 0.875rem;
    margin: 0 0 20px;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.confirm-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

/* Action buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
    min-width: 48px;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.btn--danger {
    color: rgb(var(--v-theme-error));
}

.btn--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}
</style>
