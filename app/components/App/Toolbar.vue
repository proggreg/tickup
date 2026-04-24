<script setup lang="ts">
import { Button } from '@vuetify/v0';

const on = useToolbar();
const store = useListsStore();

const toolbarOn = computed(() => {
    if (!store.currentList.todos || store.currentList.todos.length === 0) return false;
    return store.currentList.todos.some(todo => todo.selected);
});

function deleteSelected() {
    const deleteTodos = store.currentList.todos.filter(todo => todo.selected);
    for (const todo of deleteTodos) {
        if (!todo.id) continue;
        store.deleteTodo(todo.id);
    }
    store.currentList.todos = store.currentList.todos.filter(todo => !todo.selected);

    on.value = false;
}
</script>

<template>
    <Teleport to="body">
        <Transition name="toolbar">
            <div
                v-if="toolbarOn"
                class="selection-toolbar"
                role="status"
            >
                <Button.Root
                    class="toolbar-btn"
                    @click="on = false"
                >
                    <Button.Content>Dismiss</Button.Content>
                </Button.Root>
                <Button.Root
                    class="toolbar-btn toolbar-btn--danger"
                    @click="deleteSelected"
                >
                    <Button.Content>Delete</Button.Content>
                </Button.Root>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.selection-toolbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(247, 249, 251, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(42, 52, 57, 0.12);
    z-index: 1000;
}

.toolbar-btn {
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

.toolbar-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.toolbar-btn--danger {
    color: rgb(var(--v-theme-error));
}

.toolbar-btn--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}

.toolbar-enter-active,
.toolbar-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.toolbar-enter-from,
.toolbar-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
}
</style>
