<script setup lang="ts">
import { Button } from '@vuetify/v0';

const { userId: _userId } = useCurrentUser();
const modelValue = defineModel<string>({ default: 'todo' });
const listsStore = useListsStore();

watch(() => modelValue.value, (_newTab) => {
    listsStore.getTodaysTodos?.();
});

onBeforeMount(() => {
    listsStore.getTodaysTodos();
});
</script>

<template>
    <div class="tabs-wrapper">
        <div class="pill-tabs-container">
            <Button.Group
                v-model="modelValue"
                class="pill-tabs"
            >
                <Button.Root
                    value="overdue"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'overdue' }"
                >
                    <Button.Content>Overdue</Button.Content>
                </Button.Root>
                <Button.Root
                    value="todo"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'todo' }"
                >
                    <Button.Content>Todo</Button.Content>
                </Button.Root>
                <Button.Root
                    value="done"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'done' }"
                >
                    <Button.Content>Done</Button.Content>
                </Button.Root>
            </Button.Group>
        </div>
    </div>
</template>

<style scoped>
.tabs-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    padding: 0 16px;
}

.pill-tabs-container {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    display: inline-flex;
    padding: 4px;
}

.pill-tabs {
    display: flex;
    gap: 2px;
}

.pill-tab-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50px;
    min-width: 100px;
    padding: 6px 16px;
    font-size: 1.25rem;
    font-weight: 500;
    opacity: 0.6;
    transition: opacity 0.2s, background 0.2s;
    color: inherit;
    letter-spacing: 0;
    text-transform: none;
}

.pill-tab-btn:hover {
    opacity: 0.8;
}

.pill-tab-btn--active {
    background: rgba(255, 255, 255, 0.15);
    opacity: 1;
}
</style>
