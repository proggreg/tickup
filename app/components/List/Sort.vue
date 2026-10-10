<script setup lang="ts">
const store = useListsStore();
const { sortOptions } = storeToRefs(useSettingsStore());
const selectedSort = ref<SortValue | null>(null);
const sortDirection = ref('ascending');

function applySort() {
    if (selectedSort.value === 'priority') {
        store.sortByPriority(sortDirection.value);
    }
    else if (selectedSort.value === 'dueDate') {
        store.sortByDate(sortDirection.value);
    }
}

// Start each list on its saved default sort
watch(
    () => store.currentList,
    (list) => {
        selectedSort.value = list?.defaultSort ?? null;
        applySort();
    },
    { immediate: true },
);

watch([selectedSort, sortDirection], applySort);
const icon = ref('mdi-arrow-down');
function changeIcon() {
    if (sortDirection.value === 'ascending') {
        sortDirection.value = 'descending';
        icon.value = 'mdi-arrow-down';
    }
    else {
        sortDirection.value = 'ascending';
        icon.value = 'mdi-arrow-up';
    }
}
</script>

<template>
    <v-row>
        <v-col>
            <v-select
                v-model="selectedSort"
                data-testid="list-sort-select"
                :items="sortOptions"
                item-title="text"
                item-value="value"
                label="Sort By"
                outlined
            />
        </v-col>
        <v-col>
            <v-btn
                :icon="icon"
                @click="changeIcon"
            />
        </v-col>
    </v-row>
</template>
