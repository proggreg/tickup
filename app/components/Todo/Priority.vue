<script setup lang="ts">
const listsStore = useListsStore();

const priorities = [
    { label: 'High', value: 'high', color: 'error', icon: 'mdi-flag' },
    { label: 'Medium', value: 'medium', color: 'warning', icon: 'mdi-flag' },
    { label: 'Low', value: 'low', color: 'success', icon: 'mdi-flag' },
    { label: 'None', value: '', color: 'grey', icon: 'mdi-flag-outline' },
];

const current = computed(() => {
    const p = listsStore.currentTodo.priorityLev?.toLowerCase();
    return priorities.find(x => x.value === p) ?? priorities[3];
});

function select(value: string) {
    listsStore.currentTodo.priorityLev = value;
    listsStore.updateTodo(listsStore.currentTodo);
}
</script>

<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                :icon="current.icon"
                :color="current.color"
                size="small"
                variant="text"
                density="compact"
                data-testid="todo-priority-button"
            />
        </template>
        <v-list density="compact">
            <v-list-item
                v-for="p in priorities"
                :key="p.value || 'none'"
                :data-testid="`todo-priority-${p.label.toLowerCase()}`"
                @click="select(p.value)"
            >
                <template #prepend>
                    <v-icon :color="p.color">
                        {{ p.icon }}
                    </v-icon>
                </template>
                <v-list-item-title>{{ p.label }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
