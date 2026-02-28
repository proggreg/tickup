<script setup lang="ts">
const { subtask, index } = defineProps<{ subtask: Todo; index: number }>();
const emit = defineEmits(['updatePriority']);

function getPriorityColor(priority: string | undefined): string {
    if (!priority) return 'grey';
    switch (priority.toLowerCase()) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'grey';
    }
}

function getPriorityIcon(priority: string | undefined): string {
    if (!priority) return 'mdi-flag-outline';
    switch (priority.toLowerCase()) {
        case 'high': return 'mdi-flag';
        case 'medium': return 'mdi-flag';
        case 'low': return 'mdi-flag';
        default: return 'mdi-flag-outline';
    }
}
</script>

<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                :icon="getPriorityIcon(subtask.priorityLev)"
                :color="getPriorityColor(subtask.priorityLev)"
                size="small"
                variant="text"
                density="compact"
                :data-testid="`subtask-priority-${index}`"
            />
        </template>
        <v-list density="compact">
            <v-list-item
                :data-testid="`subtask-priority-high-${index}`"
                @click="emit('updatePriority', 'high')"
            >
                <template #prepend>
                    <v-icon color="error">
                        mdi-flag
                    </v-icon>
                </template>
                <v-list-item-title>High</v-list-item-title>
            </v-list-item>
            <v-list-item
                :data-testid="`subtask-priority-medium-${index}`"
                @click="emit('updatePriority', 'medium')"
            >
                <template #prepend>
                    <v-icon color="warning">
                        mdi-flag
                    </v-icon>
                </template>
                <v-list-item-title>Medium</v-list-item-title>
            </v-list-item>
            <v-list-item
                :data-testid="`subtask-priority-low-${index}`"
                @click="emit('updatePriority', 'low')"
            >
                <template #prepend>
                    <v-icon color="success">
                        mdi-flag
                    </v-icon>
                </template>
                <v-list-item-title>Low</v-list-item-title>
            </v-list-item>
            <v-list-item
                :data-testid="`subtask-priority-none-${index}`"
                @click="emit('updatePriority', '')"
            >
                <template #prepend>
                    <v-icon color="grey">
                        mdi-flag-outline
                    </v-icon>
                </template>
                <v-list-item-title>None</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
