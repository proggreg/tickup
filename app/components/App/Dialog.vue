<script setup lang="ts">
import { Button, Dialog } from '@vuetify/v0';

const { title, page } = defineProps<{
    title: string;
    page: string;
}>();
const dialog = useDialog();
const listsStore = useListsStore();

const isOpen = computed(() => dialog.value.open && dialog.value.page === page);

function close() {
    dialog.value.open = false;
}

function resetState() {
    dialog.value.open = false;
    dialog.value.page = '';
    listsStore.resetTodo();
}

// Use a watcher to open/close the native dialog element programmatically
const dialogEl = ref<HTMLDialogElement | null>(null);

watch(isOpen, (val) => {
    if (!dialogEl.value) return;
    if (val) {
        dialogEl.value.showModal();
    }
    else {
        dialogEl.value.close();
    }
});
</script>

<template>
    <slot name="open" />

    <dialog
        ref="dialogEl"
        class="app-dialog"
        @close="resetState"
        @click.self="close"
    >
        <div class="app-dialog__card">
            <div class="app-dialog__header">
                <h2
                    class="app-dialog__title font-weight-bold"
                    data-testid="dialog-title"
                >
                    {{ title }}
                </h2>
                <Button.Root
                    class="icon-btn"
                    aria-label="Close dialog"
                    data-testid="dialog-close"
                    @click="close"
                >
                    <Button.Icon>
                        <i class="mdi mdi-close" />
                    </Button.Icon>
                </Button.Root>
            </div>

            <div class="app-dialog__body">
                <slot />
            </div>

            <div class="app-dialog__actions">
                <Button.Root
                    class="btn"
                    @click="close"
                >
                    <Button.Content>Close</Button.Content>
                </Button.Root>
                <slot name="buttons" />
            </div>
        </div>
    </dialog>
</template>

<style scoped>
.app-dialog {
    border: none;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90vw;
    background: transparent;
    overflow: visible;
}

.app-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.app-dialog__card {
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.app-dialog__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
}

.app-dialog__body {
    flex: 1;
}

.app-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
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

.icon-btn .mdi {
    font-size: 18px;
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
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
