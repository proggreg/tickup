<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
});
</script>

<template>
    <div
        class="d-flex flex-column"
    >
        <div
            class="flex-grow-1 overflow-y-auto pa-4 pb-2"
            data-testid="search-results-container"
        >
            <SearchResults :disable-status-button="true" />
        </div>

        <div
            class="flex-shrink-0 pt-2 px-4 pb-4 bg-background position-fixed bottom-10"
            style="width: 100%; bottom: 45px;"
            data-testid="search-input-fixed"
        >
            <Search />
        </div>
    </div>
</template>
