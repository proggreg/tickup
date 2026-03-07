<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
});
</script>

<template>
    <div class="search-page">
        <div
            class="search-results-container"
            data-testid="search-results-container"
        >
            <SearchResults :disable-status-button="true" />
        </div>

        <div
            class="search-input-bar"
            data-testid="search-input-fixed"
        >
            <Search />
        </div>
    </div>
</template>

<style scoped>
.search-page {
    display: flex;
    flex-direction: column;
    height: 100dvh;
}

.search-results-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 8px;
}

.search-input-bar {
    padding: 8px 16px 16px;
    background: rgb(var(--v-theme-background));
    flex-shrink: 0;
}
</style>
