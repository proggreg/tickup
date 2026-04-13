<script setup lang="ts">
import { Select } from '@vuetify/v0';

const listTypeOptions = ref<ListType[]>(['table', 'simple']);
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
                <Select.Value placeholder="simple" />
                <i class="mdi mdi-chevron-down" />
            </button>
        </Select.Activator>
        <Select.Content>
            <Select.Item
                v-for="option in listTypeOptions"
                :key="option"
                :value="option"
                class="select-item"
            >
                <span class="select-item__text">{{ option }}</span>
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
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    min-width: 60px;
    max-width: 150px;
    white-space: nowrap;
}

.type-select-trigger:hover {
    border-color: rgba(var(--v-border-color), 0.6);
}

.type-select-trigger .mdi {
    font-size: 16px;
    opacity: 0.6;
    margin-left: auto;
}

.select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.select-item__text {
    flex: 1;
    text-transform: capitalize;
}

.select-item__check {
    font-size: 16px;
    color: rgb(var(--v-theme-primary));
}
</style>
