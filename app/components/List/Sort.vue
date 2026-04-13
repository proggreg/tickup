<script setup lang="ts">
import { Button, Select } from '@vuetify/v0';

const store = useListsStore();
const selectedSort = ref<string | null>(null);
const sortOptions = [
    { text: 'Default', value: 'default' },
    { text: 'Priority', value: 'priority' },
    { text: 'Due Date', value: 'dueDate' },
];
const sortDirection = ref('ascending');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch([selectedSort, sortDirection], ([newOption, newDirection]) => {
    store.sortByDate(newDirection);
});
const icon = ref('mdi-arrow-down');
function changeIcon() {
    if (sortDirection.value === 'ascending') {
        sortDirection.value = 'descending';
        icon.value = 'mdi-arrow-down';
    }
    else {
        sortDirection.value = 'ascending';
        icon.value = 'mdi-arrow-up';
    }
}
</script>

<template>
    <div class="sort-row">
        <div class="sort-select-col">
            <Select.Root v-model="selectedSort">
                <Select.Activator class="select-activator">
                    <Select.Value v-slot="{ selectedValue }">
                        {{ selectedValue || 'Sort By' }}
                    </Select.Value>
                    <Select.Cue v-slot="{ isOpen }">
                        <i :class="isOpen ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'" />
                    </Select.Cue>
                </Select.Activator>
                <Select.Content class="select-content">
                    <Select.Item
                        v-for="option in sortOptions"
                        :id="option.value"
                        :key="option.value"
                        :value="option.value"
                        v-slot="{ isSelected, attrs }"
                    >
                        <div
                            v-bind="attrs"
                            class="select-item"
                            :class="{ 'select-item--selected': isSelected }"
                        >
                            {{ option.text }}
                        </div>
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="sort-dir-col">
            <Button.Root
                class="icon-btn"
                :aria-label="sortDirection === 'ascending' ? 'Sort ascending' : 'Sort descending'"
                @click="changeIcon"
            >
                <Button.Icon>
                    <i :class="`mdi ${icon}`" />
                </Button.Icon>
            </Button.Root>
        </div>
    </div>
</template>

<style scoped>
.sort-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-select-col {
    flex: 1;
}

.sort-dir-col {
    flex-shrink: 0;
}

.select-activator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    gap: 8px;
}

.select-activator:hover {
    border-color: rgba(var(--v-border-color), 0.7);
}

.select-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 160px;
    z-index: 100;
}

.select-item {
    padding: 8px 12px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.select-item--selected {
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.08);
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}
</style>
