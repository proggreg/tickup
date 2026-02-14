<script setup lang="ts">
interface Model {
    id: string;
    name: string;
    description: string;
}

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const { data: models, status } = await useFetch<Model[]>('/api/chat/models');

const selected = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
});

onMounted(async () => {
    const models = await $fetch<Model[]>('/api/chat/models');
    console.log('models', models);
});
</script>

<template>
    <v-select
        v-model="selected"
        :items="models ?? []"
        :loading="status === 'pending'"
        item-title="name"
        item-value="id"
        label="Model"
        density="compact"
        variant="outlined"
        hide-details
        data-testid="chat-model-select"
    >
        <template #item="{ props: itemProps, item }">
            <v-list-item
                v-bind="itemProps"
                :subtitle="item.raw.description"
                lines="two"
            />
        </template>
    </v-select>
</template>
