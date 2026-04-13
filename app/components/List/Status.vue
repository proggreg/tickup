<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const settings = useSettingsStore();
const store = useListsStore();
const statusProps = withDefaults(defineProps<{ todo: Todo; disabled?: boolean }>(), {
    disabled: false,
});
const statuses = computed(() => settings.statuses);
function getStatusColor(todoStatus: string) {
    if (!statuses.value) return;
    const status = statuses.value.filter(status => status.name === todoStatus);
    if (status.length > 0) {
        return status[0].color;
    }
}

const updateStatus = (status: string) => {
    const updatedTodo = statusProps.todo;
    updatedTodo.status = status;
    store.updateTodo(updatedTodo);
};
</script>

<template>
    <Popover.Root :disabled="statusProps.disabled">
        <Popover.Activator>
            <button
                class="status-dot"
                data-testid="status-button"
                :disabled="statusProps.disabled"
                :style="{ backgroundColor: getStatusColor(statusProps.todo.status) }"
                :aria-label="`Status: ${statusProps.todo.status}`"
            />
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <ul class="menu-list">
                <li
                    v-for="(status, index) in statuses"
                    :key="index"
                    class="menu-item"
                    @click="updateStatus(status.name)"
                >
                    <button
                        class="status-dot status-dot--sm"
                        :style="{ backgroundColor: status.color }"
                    />
                    <span class="menu-item__label">{{ status.name }}</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.status-dot {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
}

.status-dot--sm {
    width: 14px;
    height: 14px;
    cursor: default;
}

.status-dot:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 200px;
    z-index: 100;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item__label {
    font-size: 0.875rem;
}
</style>
