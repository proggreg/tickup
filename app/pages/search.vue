<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
});

const NAV_HEIGHT = 56;
const inputBottom = ref(NAV_HEIGHT);

if (import.meta.client) {
    const update = () => {
        const vvHeight = window.visualViewport?.height ?? window.innerHeight;
        const keyboardHeight = window.innerHeight - vvHeight;
        inputBottom.value = keyboardHeight > 0 ? keyboardHeight : NAV_HEIGHT;
    };
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    onUnmounted(() => {
        window.visualViewport?.removeEventListener('resize', update);
        window.visualViewport?.removeEventListener('scroll', update);
    });
}
</script>

<template>
    <div class="search-page">
        <div
            class="search-results"
            data-testid="search-results-container"
        >
            <SearchResults :disable-status-button="true" />
        </div>

        <div
            class="search-input-fixed"
            data-testid="search-input-fixed"
            :style="{ bottom: `${inputBottom}px` }"
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
    z-index: 10;
    padding: 8px 16px 16px;
    background: rgb(var(--v-theme-background));
}
</style>
