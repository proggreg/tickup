<script setup lang="ts">
const props = defineProps<{
    filter: 'all' | 'active';
    sortBy: 'none' | 'priority';
    hasSubtasks: boolean;
}>();

const emit = defineEmits<{
    'update:filter': [value: 'all' | 'active'];
    'update:sortBy': [value: 'none' | 'priority'];
}>();

function toggleSort() {
    emit('update:sortBy', props.sortBy === 'priority' ? 'none' : 'priority');
}

function setFilter(value: 'all' | 'active') {
    emit('update:filter', value);
}
</script>

<template>
    <div
        v-if="hasSubtasks"
        class="d-flex align-center"
    >
        <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
                <v-btn
                    v-bind="tooltipProps"
                    :icon="sortBy === 'priority' ? 'mdi-sort-variant' : 'mdi-sort-variant'"
                    :color="sortBy === 'priority' ? 'primary' : 'grey-darken-1'"
                    variant="tonal"
                    size="x-small"
                    density="compact"
                    data-testid="subtasks-sort-button"
                    @click.stop="toggleSort"
                />
            </template>
            <span>{{ sortBy === 'priority' ? 'Sorted by priority (click to unsort)' : 'Click to sort by priority' }}</span>
        </v-tooltip>

        <v-spacer />

        <div
            class="d-flex align-center"
            data-testid="subtasks-filter"
        >
            <v-btn
                :variant="filter === 'all' ? 'tonal' : 'outlined'"
                :color="filter === 'all' ? 'primary' : undefined"
                size="small"
                data-testid="filter-all"
                class="px-3"
                @click.stop="setFilter('all')"
            >
                All
            </v-btn>
            <v-btn
                :variant="filter === 'active' ? 'tonal' : 'outlined'"
                :color="filter === 'active' ? 'primary' : undefined"
                size="small"
                data-testid="filter-active"
                class="px-3 ml-2"
                @click.stop="setFilter('active')"
            >
                Active
            </v-btn>
        </div>

        <v-btn
            :icon="$slots.default ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            variant="text"
            size="x-small"
            density="compact"
            class="ml-2"
            data-testid="subtasks-toggle"
        />
    </div>
</template>
