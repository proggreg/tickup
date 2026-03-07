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
            class="search-results"
            data-testid="search-results-container"
        >
            <SearchResults />
        </div>

        <div
            class="search-input-fixed"
            data-testid="search-input-fixed"
        >
            <Search />
        </div>
    </div>
</template>

<style scoped>
.search-page {
    height: 100%;
    overflow: hidden;
}

.search-results {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 132px;
}

.search-input-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 56px;
    z-index: 10;
    padding: 8px 16px 16px;
    background: rgb(var(--v-theme-background));
}
</style>
