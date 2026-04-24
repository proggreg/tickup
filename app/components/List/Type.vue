<script setup lang="ts">
import { Select } from '@vuetify/v0';

const listTypeOptions = ref<{ value: ListType; icon: string; label: string }[]>([
    { value: 'simple', icon: 'mdi-format-list-bulleted', label: 'List' },
    { value: 'table', icon: 'mdi-table', label: 'Table' },
]);
const props = defineProps<{ currentListType?: ListType }>();
const selectedType = ref<ListType>(props.currentListType && props.currentListType !== '' ? props.currentListType : 'simple');
const emit = defineEmits<{
    listTypeUpdated: [listType: ListType];
}>();

// Watch for prop changes to update selectedType
watch(() => props.currentListType, (newVal) => {
    const validValue = newVal && newVal !== '' ? newVal : 'simple';
    if (validValue !== selectedType.value) {
        selectedType.value = validValue;
    }
}, { immediate: true });

// Watch for selectedType changes to emit updates
watch(selectedType, (newVal: ListType, oldVal: ListType) => {
    if (newVal !== oldVal) {
        emit('listTypeUpdated', newVal);
    }
});
</script>

<template>
    <Select.Root
        v-model="selectedType"
        data-testid="list-type-select"
    >
        <Select.Activator>
            <button class="type-select-trigger">
                <i :class="`mdi ${listTypeOptions.find(o => o.value === selectedType)?.icon ?? 'mdi-format-list-bulleted'}`" class="trigger-icon" />
                <i class="mdi mdi-chevron-down trigger-chevron" />
            </button>
        </Select.Activator>
        <Select.Content>
            <Select.Item
                v-for="option in listTypeOptions"
                :key="option.value"
                :value="option.value"
                class="select-item"
            >
                <i :class="`mdi ${option.icon} select-item__icon`" />
                <span class="select-item__text">{{ option.label }}</span>
                <Select.ItemIndicator>
                    <i class="mdi mdi-check select-item__check" />
                </Select.ItemIndicator>
            </Select.Item>
        </Select.Content>
    </Select.Root>
</template>

<style scoped>
.type-select-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    background: rgba(var(--v-border-color), 0.06);
    color: inherit;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
}

.type-select-trigger:hover {
    background: rgba(var(--v-border-color), 0.12);
}

.trigger-icon {
    font-size: 17px;
}

.trigger-chevron {
    font-size: 14px;
    opacity: 0.5;
}

.select-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.select-item__icon {
    font-size: 16px;
    opacity: 0.7;
}

.select-item__text {
    flex: 1;
}

.select-item__check {
    font-size: 16px;
    color: rgb(var(--v-theme-primary));
}
</style>
