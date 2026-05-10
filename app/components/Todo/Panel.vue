<script setup lang="ts">
import { Button, Dialog } from '@vuetify/v0';

const listsStore = useListsStore();
const router = useRouter();

defineEmits(['close']);

function openFullPage() {
    router.push(`/todo/${listsStore.currentTodo.id}`);
}
</script>

<template>
    <aside class="todo-panel">
        <!-- Panel header -->
        <div class="panel-header">
            <div class="panel-header__start">
                <Button.Root
                    class="icon-btn"
                    title="Open full page"
                    aria-label="Open full page"
                    @click="openFullPage"
                >
                    <Button.Icon>
                        <i class="mdi mdi-arrow-expand" />
                    </Button.Icon>
                </Button.Root>
            </div>

            <div class="panel-header__end">
                <!-- Delete with confirm dialog -->
                <Dialog.Root>
                    <Dialog.Activator>
                        <Button.Root
                            class="icon-btn icon-btn--danger"
                            title="Delete task"
                            aria-label="Delete task"
                        >
                            <Button.Icon>
                                <i class="mdi mdi-trash-can-outline" />
                            </Button.Icon>
                        </Button.Root>
                    </Dialog.Activator>
                    <!-- Background on inner div, not on <dialog> element -->
                    <Dialog.Content class="confirm-shell">
                        <div class="confirm-dialog">
                            <Dialog.Title class="confirm-dialog__title"> Delete task </Dialog.Title>
                            <Dialog.Description class="confirm-dialog__desc">
                                Are you sure you want to delete "{{ listsStore.currentTodo.name }}"?
                            </Dialog.Description>
                            <div class="confirm-dialog__actions">
                                <Dialog.Close class="btn"> Cancel </Dialog.Close>
                                <Dialog.Close
                                    class="btn btn--danger"
                                    @click="listsStore.deleteTodo(listsStore.currentTodo.id)"
                                >
                                    Delete
                                </Dialog.Close>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Root>

                <!-- Close panel -->
                <Button.Root
                    class="icon-btn"
                    title="Close panel"
                    aria-label="Close panel"
                    @click="$emit('close')"
                >
                    <Button.Icon>
                        <i class="mdi mdi-close" />
                    </Button.Icon>
                </Button.Root>
            </div>
        </div>

        <!-- Panel content -->
        <div class="panel-body">
            <Suspense>
                <TodoDetail />
            </Suspense>
        </div>
    </aside>
</template>

<style scoped>
.todo-panel {
    width: 400px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(var(--v-border-color), 0.14);
    background: rgb(var(--v-theme-surface));
    height: 100%;
    overflow: hidden;
}

.panel-header {
    height: 44px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.14);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    flex-shrink: 0;
}

.panel-header__start,
.panel-header__end {
    display: flex;
    align-items: center;
    gap: 2px;
}

.panel-body {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--v-border-color), 0.2) transparent;
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
    color: rgba(var(--v-theme-on-surface), 0.5);
    padding: 0;
    transition:
        background 0.1s,
        color 0.1s;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
    color: rgb(var(--v-theme-on-surface));
}

.icon-btn--danger:hover {
    background: rgba(var(--v-theme-tertiary), 0.08);
    color: rgb(var(--v-theme-tertiary));
}

.icon-btn .mdi {
    font-size: 15px;
}

/* Dialog.Content shell — sizing only, no display override */
.confirm-shell {
    border: none;
    padding: 0;
    width: 280px;
    max-width: 90vw;
    margin: auto;
    background: transparent;
    overflow: visible;
}

/* Inner card carries the background */
.confirm-dialog {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

.confirm-dialog__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 8px;
    display: block;
}

.confirm-dialog__desc {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
    margin: 0 0 20px;
    line-height: 1.5;
    display: block;
}

.confirm-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
}

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
    font-family: inherit;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.btn--danger {
    color: rgb(var(--v-theme-tertiary));
}

.btn--danger:hover {
    background: rgba(var(--v-theme-tertiary), 0.08);
}
</style>

<style>
/* ::backdrop can't be scoped */
.confirm-shell::backdrop {
    background: rgba(0, 0, 0, 0.4);
}
</style>
