<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';

const { subtask, index } = defineProps<{ subtask: Todo; index: number }>();
const emit = defineEmits(['updatePriority']);

function getPriorityColor(priority: string | undefined): string {
    if (!priority) return 'rgba(var(--v-border-color), 0.54)';
    switch (priority.toLowerCase()) {
        case 'high': return 'rgb(var(--v-theme-error))';
        case 'medium': return 'rgb(var(--v-theme-warning))';
        case 'low': return 'rgb(var(--v-theme-success))';
        default: return 'rgba(var(--v-border-color), 0.54)';
    }
}

function getPriorityIcon(priority: string | undefined): string {
    if (!priority) return 'mdi-flag-outline';
    switch (priority.toLowerCase()) {
        case 'high':
        case 'medium':
        case 'low':
            return 'mdi-flag';
        default: return 'mdi-flag-outline';
    }
}

const priorityItems = [
    { label: 'High', value: 'high', colorVar: '--v-theme-error' },
    { label: 'Medium', value: 'medium', colorVar: '--v-theme-warning' },
    { label: 'Low', value: 'low', colorVar: '--v-theme-success' },
    { label: 'None', value: '', colorVar: null },
];
</script>

<template>
    <Popover.Root>
        <Popover.Activator>
            <Button.Root
                class="icon-btn"
                :aria-label="`Priority: ${subtask.priorityLev || 'none'}`"
                :data-testid="`subtask-priority-${index}`"
            >
                <Button.Icon>
                    <i
                        :class="`mdi ${getPriorityIcon(subtask.priorityLev)}`"
                        :style="{ color: getPriorityColor(subtask.priorityLev) }"
                    />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <ul class="menu-list">
                <li
                    v-for="item in priorityItems"
                    :key="item.value"
                    class="menu-item"
                    :data-testid="`subtask-priority-${item.value || 'none'}-${index}`"
                    @click="emit('updatePriority', item.value)"
                >
                    <i
                        class="mdi"
                        :class="item.value ? 'mdi-flag' : 'mdi-flag-outline'"
                        :style="item.colorVar ? { color: `rgb(var(${item.colorVar}))` } : { color: 'rgba(var(--v-border-color), 0.54)' }"
                    />
                    <span>{{ item.label }}</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
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

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 140px;
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
    padding: 6px 12px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item .mdi {
    font-size: 16px;
    width: 20px;
}
</style>
