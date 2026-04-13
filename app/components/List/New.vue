<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';

const listsStore = useListsStore();
const navOpen = useNav();
const { smAndDown } = useDisplay();
const dialog = useDialog();

async function createNewList() {
    if (!listsStore.newList.name.length) return;
    try {
        const list = await listsStore.addList();

        if (list) {
            dialog.value.open = false;

            if (smAndDown.value) {
                navOpen.value = false;
            }
        }
    }
    catch {
        // Error is already handled by showError() in the store
        // The toast will be shown automatically via useError()
    }
}
</script>

<template>
    <AppDialog
        title="New List"
        page="list"
    >
        <template #open />
        <div class="new-list-body">
            <div class="new-list-field">
                <Input.Root v-model="listsStore.newList.name">
                    <Input.Control
                        class="list-name-input"
                        autofocus
                        placeholder="New List"
                        data-test-id="new-list-input"
                        @keyup.enter="createNewList"
                    />
                </Input.Root>
                <div
                    v-if="!smAndDown"
                    class="list-type-wrapper"
                >
                    <ListType />
                </div>
            </div>
        </div>
        <template #buttons>
            <Button.Root
                class="btn btn--primary"
                :disabled="!listsStore.newList.name.length"
                data-testid="new-list-save"
                @click="createNewList"
            >
                Save
            </Button.Root>
        </template>
    </AppDialog>
</template>

<style scoped>
.new-list-body {
    padding: 16px;
}

.new-list-field {
    display: flex;
    align-items: center;
    gap: 12px;
}

.list-name-input {
    flex: 1;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.list-name-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.list-type-wrapper {
    min-width: 150px;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s;
}

.btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn--primary {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.btn--primary:hover:not(:disabled) {
    background: rgba(var(--v-theme-primary), 0.2);
}
</style>
