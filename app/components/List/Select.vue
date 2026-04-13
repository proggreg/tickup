<script setup lang="ts">
import { Select } from '@vuetify/v0';

const listsStore = useListsStore();

const props = withDefaults(defineProps<{
    modelValue?: string | null;
    label?: string;
}>(), {
    modelValue: undefined,
    label: undefined,
});

const emit = defineEmits<{
    'update:modelValue': [value: string | null];
}>();

const selectedId = computed({
    get: () => props.modelValue !== undefined ? props.modelValue : listsStore.currentList.id,
    set: (val) => {
        if (props.modelValue !== undefined) {
            emit('update:modelValue', val);
        }
        else {
            listsStore.currentList.id = val;
        }
    },
});

onBeforeMount(() => {
    listsStore.getLists();
});

onUnmounted(() => {
    if (props.modelValue === undefined) {
        listsStore.currentList.id = null;
    }
});
</script>

<template>
    <Select.Root
        v-model="selectedId"
        data-testid="list-select"
    >
        <Select.Activator>
            <button class="list-select-trigger">
                <Select.Value :placeholder="label || 'Select list'" />
                <i class="mdi mdi-chevron-down" />
            </button>
        </Select.Activator>
        <Select.Content>
            <Select.Item
                value=""
                class="select-item"
            >
                <span class="select-item__text">None</span>
            </Select.Item>
            <Select.Item
                v-for="list in listsStore.lists"
                :key="list.id"
                :value="list.id"
                class="select-item"
            >
                <span class="select-item__text">{{ list.name }}</span>
                <Select.ItemIndicator>
                    <i class="mdi mdi-check select-item__check" />
                </Select.ItemIndicator>
            </Select.Item>
        </Select.Content>
    </Select.Root>
</template>

<style scoped>
.list-select-trigger {
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
    min-width: 75px;
    white-space: nowrap;
}

.list-select-trigger:hover {
    border-color: rgba(var(--v-border-color), 0.6);
}

.list-select-trigger .mdi {
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
}

.select-item__check {
    font-size: 16px;
    color: rgb(var(--v-theme-primary));
}
</style>
