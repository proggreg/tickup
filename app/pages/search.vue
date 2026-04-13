<script setup lang="ts">
import { Input } from '@vuetify/v0';

definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
    layout: 'mobile',
});

const searchStore = useSearchStore();

watch(() => searchStore.searchQuery, () => {
    searchStore.debouncedSearch();
});

onMounted(() => {
    searchStore.search();
});
</script>

<template>
    <div class="search-page">
        <div class="search-page__header">
            <div class="search-page__title-row">
                <span class="search-page__title">Search</span>
                <span
                    v-if="searchStore.results.length"
                    class="search-badge"
                >
                    {{ searchStore.results.length }}
                </span>
            </div>

            <div class="search-field-wrapper">
                <i class="mdi mdi-magnify search-icon" />
                <Input.Root v-model="searchStore.searchQuery">
                    <Input.Control
                        class="search-input"
                        placeholder="Search todos..."
                        data-testid="mobile-search-input"
                    />
                </Input.Root>
            </div>
        </div>

        <SearchResults :disable-status-button="true" />
    </div>
</template>

<style scoped>
.search-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 80px;
}

.search-page__header {
    padding: 32px 20px 16px;
    flex-shrink: 0;
}

.search-page__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.search-page__title {
    font-size: 1.5rem;
    font-weight: 700;
}

.search-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(var(--v-border-color), 0.1);
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.search-field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    font-size: 20px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    z-index: 1;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.search-input:focus {
    border-color: rgb(var(--v-theme-primary));
}
</style>
