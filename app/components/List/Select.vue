<script setup lang="ts">
const listsStore = useListsStore();

const props = withDefaults(defineProps<{
    modelValue?: string | null;
    label?: string;
    variant?: 'filled' | 'outlined' | 'underlined' | 'plain' | 'solo' | 'solo-filled' | 'solo-inverted';
    density?: 'default' | 'comfortable' | 'compact';
    minWidth?: string | number;
}>(), {
    modelValue: undefined,
    label: undefined,
    variant: 'filled',
    density: 'default',
    minWidth: 75,
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
    <v-select
        v-model="selectedId"
        :items="listsStore.lists"
        item-title="name"
        item-value="id"
        flat
        clearable
        :label="label"
        :variant="variant"
        :density="density"
        :min-width="minWidth"
        data-testid="list-select"
    />
</template>
