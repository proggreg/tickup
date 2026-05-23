<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
    layout: 'mobile',
});

const searchStore = useSearchStore();

watch(
    () => searchStore.searchQuery,
    () => {
        searchStore.debouncedSearch();
    },
);

onMounted(() => {
    searchStore.search();
});
</script>

<template>
    <div class="d-flex flex-column h-100 pb-20">
        <div class="px-5 pt-8 pb-4 flex-shrink-0">
            <div class="d-flex align-center ga-3 mb-4">
                <span class="text-h5 font-weight-bold">Search</span>
                <v-chip v-if="searchStore.results.length" size="small" variant="tonal" label>
                    {{ searchStore.results.length }}
                </v-chip>
            </div>

            <v-text-field
                v-model="searchStore.searchQuery"
                data-testid="mobile-search-input"
                placeholder="Search todos..."
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                variant="outlined"
                rounded="lg"
                density="comfortable"
            />

            <div v-if="searchStore.availableLists.length" class="d-flex flex-wrap ga-2 mt-3">
                <v-chip
                    v-for="list in searchStore.availableLists"
                    :key="list.id"
                    size="small"
                    :variant="searchStore.selectedListId === list.id ? 'flat' : 'tonal'"
                    :color="searchStore.selectedListId === list.id ? 'primary' : undefined"
                    label
                    @click="searchStore.selectList(list.id!)"
                >
                    {{ list.name }}
                </v-chip>
            </div>
        </div>

        <SearchResults :disable-status-button="true" />
    </div>
</template>
