<script setup lang="ts">
import { Button, Select, Popover } from '@vuetify/v0';

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
    models.value?.find(m => m.id === selected.value),
);

onMounted(() => {
    if (models.value?.length) {
        selected.value = models.value[0].id;
    }
});
</script>

<template>
    <!-- Desktop: full select -->
    <Select.Root
        v-if="!mobile"
        v-model="selected"
        data-testid="chat-model-select"
    >
        <Select.Activator class="select-activator">
            <Select.Value v-slot="{ selectedValue }">
                {{ selectedValue || 'Model' }}
            </Select.Value>
            <span
                v-if="status === 'pending'"
                class="spinner"
            />
            <Select.Cue
                v-else
                v-slot="{ isOpen }"
            >
                <i :class="isOpen ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'" />
            </Select.Cue>
        </Select.Activator>
        <Select.Content class="select-content">
            <Select.Item
                v-for="model in models ?? []"
                :id="model.id"
                :key="model.id"
                :value="model.name"
                v-slot="{ isSelected, attrs }"
            >
                <div
                    v-bind="attrs"
                    class="select-item"
                    :class="{ 'select-item--selected': isSelected }"
                >
                    {{ model.name }}
                </div>
            </Select.Item>
        </Select.Content>
    </Select.Root>

    <!-- Mobile: icon button + popover -->
    <Popover.Root
        v-else
        data-testid="chat-model-select"
    >
        <Popover.Activator>
            <Button.Root
                class="icon-btn"
                :aria-label="selectedModel?.name ?? 'Select model'"
                :title="selectedModel?.name ?? 'Select model'"
                :disabled="status === 'pending'"
            >
                <Button.Icon>
                    <span
                        v-if="status === 'pending'"
                        class="spinner"
                    />
                    <i
                        v-else
                        class="mdi mdi-creation"
                    />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <p class="menu-subheader">
                Model
            </p>
            <ul class="menu-list">
                <li
                    v-for="model in models ?? []"
                    :key="model.id"
                    class="menu-item"
                    :class="{ 'menu-item--active': selected === model.id }"
                    @click="selected = model.id"
                >
                    <span class="menu-item__name">{{ model.name }}</span>
                    <span
                        v-if="model.description"
                        class="menu-item__desc"
                    >{{ model.description }}</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.select-activator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    gap: 6px;
    max-width: 200px;
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
    min-width: 200px;
    max-width: 280px;
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
    width: 38px;
    height: 38px;
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

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 200px;
    z-index: 100;
}

.menu-subheader {
    padding: 4px 12px 2px;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item--active {
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.08);
}

.menu-item__name {
    font-size: 0.875rem;
    font-weight: 500;
}

.menu-item__desc {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
