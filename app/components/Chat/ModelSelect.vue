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

const { mobile } = useDisplay();

const selectedModel = computed(() =>
    models.value?.find((m) => m.id === selected.value),
);
</script>

<template>
    <!-- Desktop: full select -->
    <v-select
        v-if="!mobile"
        v-model="selected"
        :items="models ?? []"
        :loading="status === 'pending'"
        item-title="name"
        item-value="id"
        label="Model"
        density="compact"
        variant="outlined"
        hide-details
        max-width="200"
        data-testid="chat-model-select"
    >
        <template #item="{ props: itemProps }">
            <v-list-item v-bind="itemProps" />
        </template>
    </v-select>

    <!-- Mobile: icon button + menu -->
    <v-menu
        v-else
        location="top"
        data-testid="chat-model-select"
    >
        <template #activator="{ props: menuProps }">
            <v-btn
                v-bind="menuProps"
                :loading="status === 'pending'"
                :title="selectedModel?.name ?? 'Select model'"
                icon="mdi-creation"
                variant="outlined"
                density="compact"
                size="38"
            />
        </template>

        <v-list density="compact" min-width="200">
            <v-list-subheader>Model</v-list-subheader>
            <v-list-item
                v-for="model in models ?? []"
                :key="model.id"
                :title="model.name"
                :subtitle="model.description"
                :active="selected === model.id"
                active-color="primary"
                @click="selected = model.id"
            />
        </v-list>
    </v-menu>
</template>
