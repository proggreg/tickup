<script setup lang="ts">
import { Button, Dialog } from '@vuetify/v0';

const { title, page } = defineProps<{
    title: string;
    page: string;
}>();
const dialog = useDialog();
const listsStore = useListsStore();

const isOpen = computed({
    get: () => dialog.value.open && dialog.value.page === page,
    set: (val) => {
        if (!val) {
            dialog.value.open = false;
            dialog.value.page = '';
            listsStore.resetTodo();
        }
    },
});
</script>

<template>
    <slot name="open" />

    <Dialog.Root v-model="isOpen">
        <Dialog.Content class="app-dialog">
            <div class="app-dialog__card">
                <div class="app-dialog__header">
                    <h2
                        class="app-dialog__title"
                        data-testid="dialog-title"
                    >
                        {{ title }}
                    </h2>
                    <Dialog.Close class="icon-btn" aria-label="Close dialog" data-testid="dialog-close">
                        <i class="mdi mdi-close" />
                    </Dialog.Close>
                </div>

                <div class="app-dialog__body">
                    <slot />
                </div>

                <div class="app-dialog__actions">
                    <Dialog.Close class="btn">
                        Close
                    </Dialog.Close>
                    <slot name="buttons" />
                </div>
            </div>
        </Dialog.Content>
    </Dialog.Root>
</template>

<style scoped>
/* Do NOT set display: flex here — it would override dialog's native display:none when closed */
.app-dialog {
    border: none;
    padding: 0;
    max-width: 500px;
    width: 90vw;
    margin: auto;
    background: transparent;
    overflow: visible;
}

.app-dialog__card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
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
    font-family: inherit;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>

<style>
/* ::backdrop can't be scoped — must be global */
.app-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}
</style>
