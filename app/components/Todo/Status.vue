<script setup lang="ts">
import { Popover } from '@vuetify/v0';

const listStore = useListsStore();
const { statuses } = useSettingsStore();
const currentStatus = computed((): Status => {
    const status = statuses.find(status => status.name === listStore.currentTodo.status);
    if (status) {
        return status;
    }
    return statuses[0];
});

function selectStatus(statusName: string) {
    if (!statusName) return;

    listStore.currentTodo.status = statusName;
    updateStatus(currentStatus.value.name);
}

function updateStatus(statusName: string) {
    listStore.currentTodo.status = statusName;
    listStore.updateTodo(listStore.currentTodo);
}
</script>

<template>
    <Popover.Root>
        <Popover.Activator>
            <button
                class="status-trigger"
                :style="{ background: `${currentStatus.color}22`, color: currentStatus.color, borderColor: `${currentStatus.color}44` }"
            >
                {{ listStore.currentTodo.status }}
                <i class="mdi mdi-chevron-down" />
            </button>
        </Popover.Activator>
        <Popover.Content>
            <ul class="status-menu">
                <li
                    v-for="status in statuses"
                    :key="status.name"
                    class="status-menu__item"
                    @click="selectStatus(status.name)"
                >
                    <span
                        class="status-dot"
                        :style="{ background: status.color }"
                    />
                    {{ status.name }}
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.status-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    font-family: inherit;
    white-space: nowrap;
    transition: opacity 0.15s;
}

.status-trigger:hover {
    opacity: 0.8;
}

.status-trigger .mdi {
    font-size: 14px;
    opacity: 0.7;
}

.status-menu {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 140px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.status-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.1s;
}

.status-menu__item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
