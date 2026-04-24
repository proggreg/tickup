<script setup lang="ts">
import { Button } from '@vuetify/v0';

const props = defineProps<{
    filter: 'all' | 'active';
    sortBy: 'none' | 'priority';
    hasSubtasks: boolean;
    expanded: boolean;
}>();

const emit = defineEmits<{
    'update:filter': [value: 'all' | 'active'];
    'update:sortBy': [value: 'none' | 'priority'];
    'update:expanded': [value: boolean];
}>();

function toggleSort() {
    emit('update:sortBy', props.sortBy === 'priority' ? 'none' : 'priority');
}

function setFilter(value: 'all' | 'active') {
    emit('update:filter', value);
}

function toggleExpanded() {
    emit('update:expanded', !props.expanded);
}
</script>

<template>
    <div
        v-if="hasSubtasks"
        class="filters"
    >
        <Button.Root
            class="icon-btn"
            :class="sortBy === 'priority' ? 'icon-btn--active' : ''"
            :title="sortBy === 'priority' ? 'Sorted by priority (click to unsort)' : 'Click to sort by priority'"
            data-testid="subtasks-sort-button"
            @click.stop="toggleSort"
        >
            <Button.Icon>
                <i class="mdi mdi-sort-variant" />
            </Button.Icon>
        </Button.Root>

        <div class="spacer" />

        <div
            class="filter-group"
            data-testid="subtasks-filter"
        >
            <Button.Root
                class="filter-btn"
                :class="filter === 'all' ? 'filter-btn--active' : ''"
                data-testid="filter-all"
                @click.stop="setFilter('all')"
            >
                <Button.Content>All</Button.Content>
            </Button.Root>
            <Button.Root
                class="filter-btn"
                :class="filter === 'active' ? 'filter-btn--active' : ''"
                data-testid="filter-active"
                @click.stop="setFilter('active')"
            >
                <Button.Content>Active</Button.Content>
            </Button.Root>
        </div>

        <Button.Root
            class="icon-btn"
            :aria-label="expanded ? 'Collapse subtasks' : 'Expand subtasks'"
            data-testid="subtasks-toggle"
            @click.stop="toggleExpanded"
        >
            <Button.Icon>
                <i :class="expanded ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'" />
            </Button.Icon>
        </Button.Root>
    </div>
</template>

<style scoped>
.filters {
    display: flex;
    align-items: center;
}

.spacer {
    flex: 1;
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
    color: inherit;
    padding: 0;
    margin: 0 4px;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn--active .mdi {
    color: rgb(var(--v-theme-primary));
}

.icon-btn .mdi {
    font-size: 16px;
}

.filter-group {
    display: flex;
    gap: 4px;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.24);
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: inherit;
}

.filter-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.filter-btn--active {
    background: rgba(var(--v-theme-primary), 0.12);
    border-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-primary));
}


</style>
