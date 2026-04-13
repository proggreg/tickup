<script setup lang="ts">
import { Select } from '@vuetify/v0';

// const listsStore = useListsStore()
const items = ref(['']);
const value = ref('');

// TODO finish component
</script>

<template>
    <Select.Root v-model="value">
        <Select.Activator>
            <button class="filter-trigger">
                <Select.Value placeholder="filter" />
                <i class="mdi mdi-chevron-down" />
            </button>
        </Select.Activator>
        <Select.Content>
            <Select.Item
                v-for="item in items"
                :key="item"
                :value="item"
                class="select-item"
            >
                <span>{{ item }}</span>
            </Select.Item>
        </Select.Content>
    </Select.Root>
</template>

<style scoped>
.filter-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
}

.filter-trigger .mdi {
    font-size: 16px;
    opacity: 0.6;
}

.select-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
